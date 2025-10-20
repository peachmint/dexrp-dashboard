import { Transaction, CodeInfo, AggregatedData, SortField, SortDirection, TransactionWithCode, TransactionSortField } from './types';

export function aggregateDataByCode(
  transactions: Transaction[],
  codes: CodeInfo[]
): AggregatedData[] {
  const result: AggregatedData[] = [];

  for (const code of codes) {
    const codeTransactions = transactions.filter(tx => tx.referral === code.code);

    if (codeTransactions.length === 0) {
      result.push({
        name: code.name,
        totalAmount: 0,
        purchaserCount: 0
      });
    } else {
      const totalAmount = codeTransactions.reduce((sum, tx) => sum + tx.usdAmount, 0);
      const uniquePurchasers = new Set(codeTransactions.map(tx => tx.purchaser));

      result.push({
        name: code.name,
        totalAmount: Math.round(totalAmount * 100) / 100, // 소수점 2자리로 반올림
        purchaserCount: uniquePurchasers.size
      });
    }
  }

  return result;
}

export function sortData(
  data: AggregatedData[],
  field: SortField,
  direction: SortDirection
): AggregatedData[] {
  const sorted = [...data].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (field) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'totalAmount':
        aValue = a.totalAmount;
        bValue = b.totalAmount;
        break;
      case 'purchaserCount':
        aValue = a.purchaserCount;
        bValue = b.purchaserCount;
        break;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    }
  });

  return sorted;
}

export function filterData(data: AggregatedData[], searchTerm: string): AggregatedData[] {
  if (!searchTerm.trim()) {
    return data;
  }

  const searchLower = searchTerm.toLowerCase();

  return data.filter(item =>
    item.name.toLowerCase().includes(searchLower) ||
    item.totalAmount.toString().includes(searchTerm)
  );
}

// 이더리움 주소 형식인지 확인
export function isEthereumAddress(str: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(str);
}

// 거래 데이터에 코드명 추가
export function enrichTransactionsWithCodeNames(
  transactions: Transaction[],
  codes: CodeInfo[]
): TransactionWithCode[] {
  const codeMap = new Map(codes.map(code => [code.code, code.name]));

  return transactions.map(tx => ({
    ...tx,
    codeName: codeMap.get(tx.referral) || 'Unknown'
  }));
}

// 거래 데이터 검색
export function searchTransactions(
  transactions: TransactionWithCode[],
  searchTerm: string
): TransactionWithCode[] {
  if (!searchTerm.trim()) {
    return transactions;
  }

  const searchLower = searchTerm.toLowerCase();

  // 이더리움 주소인 경우 정확히 매칭
  if (isEthereumAddress(searchTerm)) {
    return transactions.filter(tx =>
      tx.purchaser.toLowerCase() === searchLower
    );
  }

  // 일반 검색어인 경우 여러 필드에서 검색
  return transactions.filter(tx =>
    tx.purchaser.toLowerCase().includes(searchLower) ||
    tx.codeName.toLowerCase().includes(searchLower) ||
    tx.usdAmount.toString().includes(searchTerm) ||
    tx.transactionHash.toLowerCase().includes(searchLower)
  );
}

// 거래 데이터 정렬
export function sortTransactions(
  transactions: TransactionWithCode[],
  field: TransactionSortField,
  direction: SortDirection
): TransactionWithCode[] {
  const sorted = [...transactions].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (field) {
      case 'purchaser':
        aValue = a.purchaser;
        bValue = b.purchaser;
        break;
      case 'usdAmount':
        aValue = a.usdAmount;
        bValue = b.usdAmount;
        break;
      case 'blockTimestamp':
        aValue = a.blockTimestamp;
        bValue = b.blockTimestamp;
        break;
      case 'referral':
        aValue = a.codeName;
        bValue = b.codeName;
        break;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    }
  });

  return sorted;
}
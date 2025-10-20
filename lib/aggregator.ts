import { Transaction, CodeInfo, AggregatedData, SortField, SortDirection } from './types';

export function aggregateDataByCode(
  transactions: Transaction[],
  codes: CodeInfo[]
): AggregatedData[] {
  const result: AggregatedData[] = [];

  for (const code of codes) {
    const codeTransactions = transactions.filter(tx => tx.referral === code.code);

    if (codeTransactions.length === 0) {
      continue;
    }

    const totalAmount = codeTransactions.reduce((sum, tx) => sum + tx.usdAmount, 0);
    const uniquePurchasers = new Set(codeTransactions.map(tx => tx.purchaser));

    result.push({
      name: code.name,
      totalAmount: Math.round(totalAmount * 100) / 100, // 소수점 2자리로 반올림
      purchaserCount: uniquePurchasers.size
    });
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
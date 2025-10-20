import { aggregateDataByCode, sortData, filterData } from '../lib/aggregator';
import { Transaction, CodeInfo, AggregatedData, SortField, SortDirection } from '../lib/types';

describe('Data Aggregator', () => {
  const mockTransactions: Transaction[] = [
    {
      chain: 1,
      purchaser: "0xfbc6343d934b922b3a60bbad2dd9ccc6a551caf6",
      token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      referral: "JLtKPde20yV",
      price: 0.13203,
      round: 207,
      amount: 1962.4334,
      usdAmount: 1962.43,
      tokensSold: 16498.5311,
      blockNumber: "23350396",
      blockTimestamp: 1757721263,
      transactionHash: "0xf149ac700cdd8c5f65aa78f7f56d3e7e3c0aaec2bcafb69cbe0a68dc57886ce3",
      usdearned: 392.486,
      tokensearned: 824.926555
    },
    {
      chain: 1,
      purchaser: "0xb42a0fd4fdde006b71f37af97c3a584f2bc871f6",
      token: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      referral: "JLtKPde20yV",
      price: 0.13203,
      round: 207,
      amount: 7417.7212,
      usdAmount: 7417.72,
      tokensSold: 64609.4022,
      blockNumber: "23351989",
      blockTimestamp: 1757740499,
      transactionHash: "0x16110b3ddeac59bbd95ce56ab2ef447bb9ba3adcf8b7931f7122ab5a60f9462d",
      usdearned: 1483.544,
      tokensearned: 3230.47011
    },
    {
      chain: 1,
      purchaser: "0xfbc6343d934b922b3a60bbad2dd9ccc6a551caf6",
      token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      referral: "JLtKPde20yV",
      price: 0.13203,
      round: 207,
      amount: 1014,
      usdAmount: 1014,
      tokensSold: 8524.8807,
      blockNumber: "23351117",
      blockTimestamp: 1757729951,
      transactionHash: "0xc4845c1ecfd3fd12bec6de9c3b82d9d91842f49e102e0c1407f8df0ac112e29c",
      usdearned: 202.8,
      tokensearned: 426.244035
    }
  ];

  const mockCodes: CodeInfo[] = [
    { name: "갱생코인", code: "JLtKPde20yV" },
    { name: "피린이", code: "aCV7H2MdNUN" }
  ];

  describe('aggregateDataByCode', () => {
    it('should aggregate transaction data by code correctly', () => {
      const result = aggregateDataByCode(mockTransactions, mockCodes);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "갱생코인",
        totalAmount: 10394.15, // 1962.43 + 7417.72 + 1014 = 10394.15
        purchaserCount: 2 // 고유 purchaser 수: 0xfbc6... 와 0xb42a...
      });
    });

    it('should handle empty transactions', () => {
      const result = aggregateDataByCode([], mockCodes);
      expect(result).toEqual([]);
    });

    it('should handle codes with no matching transactions', () => {
      const noMatchCodes: CodeInfo[] = [
        { name: "존재하지않음", code: "nonexistent" }
      ];
      const result = aggregateDataByCode(mockTransactions, noMatchCodes);
      expect(result).toEqual([]);
    });

    it('should count unique purchasers correctly', () => {
      const result = aggregateDataByCode(mockTransactions, mockCodes);
      expect(result[0].purchaserCount).toBe(2);
    });
  });

  describe('sortData', () => {
    const mockAggregatedData: AggregatedData[] = [
      { name: "A코인", totalAmount: 1000, purchaserCount: 5 },
      { name: "B코인", totalAmount: 2000, purchaserCount: 3 },
      { name: "C코인", totalAmount: 1500, purchaserCount: 8 }
    ];

    it('should sort by name ascending', () => {
      const result = sortData(mockAggregatedData, 'name', 'asc');
      expect(result[0].name).toBe("A코인");
      expect(result[1].name).toBe("B코인");
      expect(result[2].name).toBe("C코인");
    });

    it('should sort by name descending', () => {
      const result = sortData(mockAggregatedData, 'name', 'desc');
      expect(result[0].name).toBe("C코인");
      expect(result[1].name).toBe("B코인");
      expect(result[2].name).toBe("A코인");
    });

    it('should sort by totalAmount ascending', () => {
      const result = sortData(mockAggregatedData, 'totalAmount', 'asc');
      expect(result[0].totalAmount).toBe(1000);
      expect(result[1].totalAmount).toBe(1500);
      expect(result[2].totalAmount).toBe(2000);
    });

    it('should sort by purchaserCount descending', () => {
      const result = sortData(mockAggregatedData, 'purchaserCount', 'desc');
      expect(result[0].purchaserCount).toBe(8);
      expect(result[1].purchaserCount).toBe(5);
      expect(result[2].purchaserCount).toBe(3);
    });
  });

  describe('filterData', () => {
    const mockAggregatedData: AggregatedData[] = [
      { name: "갱생코인", totalAmount: 1000, purchaserCount: 5 },
      { name: "피린이", totalAmount: 2000, purchaserCount: 3 },
      { name: "크립토", totalAmount: 1500, purchaserCount: 8 }
    ];

    it('should filter by name', () => {
      const result = filterData(mockAggregatedData, "갱생");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("갱생코인");
    });

    it('should filter by amount (as string)', () => {
      const result = filterData(mockAggregatedData, "1000");
      expect(result).toHaveLength(1);
      expect(result[0].totalAmount).toBe(1000);
    });

    it('should return all data when search term is empty', () => {
      const result = filterData(mockAggregatedData, "");
      expect(result).toHaveLength(3);
    });

    it('should be case insensitive', () => {
      const result = filterData(mockAggregatedData, "갱생");
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no match found', () => {
      const result = filterData(mockAggregatedData, "존재하지않음");
      expect(result).toHaveLength(0);
    });
  });
});
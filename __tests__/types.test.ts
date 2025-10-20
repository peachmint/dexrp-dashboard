import { Transaction, CodeInfo, AggregatedData, SortField, SortDirection } from '../lib/types';

describe('Types', () => {
  it('should define Transaction interface correctly', () => {
    const transaction: Transaction = {
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
    };

    expect(transaction.chain).toBe(1);
    expect(transaction.purchaser).toBe("0xfbc6343d934b922b3a60bbad2dd9ccc6a551caf6");
    expect(transaction.usdAmount).toBe(1962.43);
  });

  it('should define CodeInfo interface correctly', () => {
    const codeInfo: CodeInfo = {
      name: "갱생코인",
      code: "JLtKPde20yV"
    };

    expect(codeInfo.name).toBe("갱생코인");
    expect(codeInfo.code).toBe("JLtKPde20yV");
  });

  it('should define AggregatedData interface correctly', () => {
    const aggregated: AggregatedData = {
      name: "갱생코인",
      totalAmount: 5000.00,
      purchaserCount: 3
    };

    expect(aggregated.name).toBe("갱생코인");
    expect(aggregated.totalAmount).toBe(5000.00);
    expect(aggregated.purchaserCount).toBe(3);
  });

  it('should define SortField type correctly', () => {
    const fields: SortField[] = ['name', 'totalAmount', 'purchaserCount'];
    expect(fields).toContain('name');
    expect(fields).toContain('totalAmount');
    expect(fields).toContain('purchaserCount');
  });

  it('should define SortDirection type correctly', () => {
    const directions: SortDirection[] = ['asc', 'desc'];
    expect(directions).toContain('asc');
    expect(directions).toContain('desc');
  });
});
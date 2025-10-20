import { fetchTransactionData } from '../lib/api-client';
import { Transaction } from '../lib/types';

// Fetch Mock 설정
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch transaction data from API successfully', async () => {
    const mockData: Transaction[] = [
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
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchTransactionData('JLtKPde20yV');

    expect(fetch).toHaveBeenCalledWith('https://backend.dexrp.io/vending/handover?code=JLtKPde20yV');
    expect(result).toEqual(mockData);
  });

  it('should handle API error responses', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchTransactionData('invalid-code')).rejects.toThrow('API 요청 실패: 404');
  });

  it('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchTransactionData('JLtKPde20yV')).rejects.toThrow('Network error');
  });

  it('should handle empty response', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const result = await fetchTransactionData('empty-code');
    expect(result).toEqual([]);
  });
});
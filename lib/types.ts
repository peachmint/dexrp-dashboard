export interface Transaction {
  chain: number;
  purchaser: string;
  token: string;
  referral: string;
  price: number;
  round: number;
  amount: number;
  usdAmount: number;
  tokensSold: number;
  blockNumber: string;
  blockTimestamp: number;
  transactionHash: string;
  usdearned: number;
  tokensearned: number;
}

export interface CodeInfo {
  name: string;
  code: string;
}

export interface AggregatedData {
  name: string;
  totalAmount: number;
  purchaserCount: number;
}

export type SortField = 'name' | 'totalAmount' | 'purchaserCount';
export type SortDirection = 'asc' | 'desc';

export type ViewMode = 'aggregated' | 'detailed';

export type TransactionSortField = 'purchaser' | 'usdAmount' | 'blockTimestamp' | 'referral';

export interface TransactionWithCode extends Transaction {
  codeName: string;
}
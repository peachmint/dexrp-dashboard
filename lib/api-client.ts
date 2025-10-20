import { Transaction } from './types';

export async function fetchTransactionData(code: string): Promise<Transaction[]> {
  const response = await fetch(`https://backend.dexrp.io/vending/handover?code=${code}`);

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
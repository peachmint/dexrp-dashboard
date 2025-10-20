import { NextResponse } from 'next/server';
import { aggregateDataByCode, enrichTransactionsWithCodeNames, findDuplicateCodes } from '@/lib/aggregator';
import cachedData from '@/data/cached-transactions.json';
import codesData from '@/data/codes.json';

export const dynamic = 'force-static';

export async function GET() {
  try {

    const codes = codesData;
    const transactions = cachedData.transactions;

    const aggregatedData = aggregateDataByCode(transactions, codes);
    const transactionsWithCodeNames = enrichTransactionsWithCodeNames(transactions, codes);
    const duplicates = findDuplicateCodes(codes);

    const stats = {
      totalCodes: cachedData.totalCodes,
      totalTransactions: cachedData.totalTransactions,
      successfulFetches: cachedData.successfulFetches,
      lastUpdated: cachedData.lastUpdated,
      cached: true
    };

    return NextResponse.json({
      aggregatedData,
      transactionData: transactionsWithCodeNames,
      stats,
      duplicateCodes: Object.fromEntries(duplicates)
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
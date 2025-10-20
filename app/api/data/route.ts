import { NextResponse } from 'next/server';
import { fetchTransactionData } from '@/lib/api-client';
import { aggregateDataByCode } from '@/lib/aggregator';
import { CodeInfo } from '@/lib/types';
import codesData from '@/data/codes.json';

export async function GET() {
  try {
    const codes: CodeInfo[] = codesData;
    const allTransactions = [];

    // 모든 코드에 대해 데이터를 가져와서 합침
    for (const code of codes) {
      try {
        const transactions = await fetchTransactionData(code.code);
        allTransactions.push(...transactions);
      } catch (error) {
        console.error(`Error fetching data for code ${code.code}:`, error);
        // 개별 코드 실패해도 전체는 계속 진행
      }
    }

    // 데이터 집계
    const aggregatedData = aggregateDataByCode(allTransactions, codes);

    return NextResponse.json({
      success: true,
      data: aggregatedData,
      totalCodes: codes.length,
      totalTransactions: allTransactions.length
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
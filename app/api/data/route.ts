import { NextResponse } from 'next/server';
import { aggregateDataByCode, enrichTransactionsWithCodeNames } from '@/lib/aggregator';
import { CodeInfo, Transaction, TransactionWithCode } from '@/lib/types';
import codesData from '@/data/codes.json';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const refresh = url.searchParams.get('refresh') === 'true';
    const mode = url.searchParams.get('mode') || 'aggregated';

    const codes: CodeInfo[] = codesData;
    const cacheFile = path.join(process.cwd(), 'data', 'cached-transactions.json');

    // 캐시 파일 존재 확인
    const cacheExists = fs.existsSync(cacheFile);

    if (!cacheExists && !refresh) {
      return NextResponse.json({
        success: false,
        error: 'No cached data available. Please refresh to fetch new data.',
        needsRefresh: true
      }, { status: 404 });
    }

    if (refresh) {
      // 새로고침 요청 시에만 실제 API 호출
      return NextResponse.json({
        success: false,
        error: 'Data refresh not implemented in API route. Please use the refresh-cache script.',
        message: 'Run: npm run refresh-cache'
      }, { status: 501 });
    }

    // 캐시된 데이터 로드
    const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));

    if (mode === 'detailed') {
      // 원본 거래 데이터에 코드명 추가
      const transactionsWithCodeNames = enrichTransactionsWithCodeNames(cacheData.transactions, codes);

      return NextResponse.json({
        success: true,
        data: transactionsWithCodeNames,
        totalCodes: cacheData.totalCodes,
        successfulFetches: cacheData.successfulFetches,
        totalTransactions: cacheData.totalTransactions,
        lastUpdated: cacheData.lastUpdated,
        cached: true,
        mode: 'detailed'
      });
    }

    // 데이터 집계 (기본 모드)
    const aggregatedData = aggregateDataByCode(cacheData.transactions, codes);

    return NextResponse.json({
      success: true,
      data: aggregatedData,
      totalCodes: cacheData.totalCodes,
      successfulFetches: cacheData.successfulFetches,
      totalTransactions: cacheData.totalTransactions,
      lastUpdated: cacheData.lastUpdated,
      cached: true,
      mode: 'aggregated'
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load data' },
      { status: 500 }
    );
  }
}
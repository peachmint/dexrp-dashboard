'use client';

import { useState, useEffect } from 'react';
import { AggregatedData, SortField, SortDirection, ViewMode, TransactionWithCode, TransactionSortField, CodeInfo } from '@/lib/types';
import { sortData, filterData, searchTransactions, sortTransactions, isEthereumAddress, aggregateDataByCode, enrichTransactionsWithCodeNames, findDuplicateCodes } from '@/lib/aggregator';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';
import TransactionTable from '@/components/TransactionTable';
import cachedData from '@/data/cached-transactions.json';
import codesData from '@/data/codes.json';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('aggregated');
  const [data, setData] = useState<AggregatedData[]>([]);
  const [transactionData, setTransactionData] = useState<TransactionWithCode[]>([]);
  const [filteredData, setFilteredData] = useState<AggregatedData[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalAmount');
  const [transactionSortField, setTransactionSortField] = useState<TransactionSortField>('blockTimestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ totalCodes: number; totalTransactions: number; successfulFetches: number; lastUpdated?: string; cached?: boolean } | null>(null);
  const [duplicateCodes, setDuplicateCodes] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // 이더리움 주소 검색 시 자동으로 상세 모드로 전환
    if (searchTerm.trim() && isEthereumAddress(searchTerm)) {
      if (viewMode === 'aggregated') {
        setViewMode('detailed');
      }
    }
  }, [searchTerm]);

  useEffect(() => {
    if (viewMode === 'aggregated') {
      let result = filterData(data, searchTerm);
      result = sortData(result, sortField, sortDirection);
      setFilteredData(result);
    } else {
      let result = searchTransactions(transactionData, searchTerm);
      result = sortTransactions(result, transactionSortField, sortDirection);
      setFilteredTransactions(result);
    }
  }, [data, transactionData, searchTerm, sortField, transactionSortField, sortDirection, viewMode]);

  const fetchData = async (mode?: ViewMode) => {
    try {
      setLoading(true);

      // 개발 환경에서는 API 사용, 배포 환경에서는 캐시 사용
      if (process.env.NODE_ENV === 'development') {
        // 개발 환경: 실시간 데이터 페칭
        const response = await fetch(`/api/data?mode=${mode || 'aggregated'}`);
        if (!response.ok) {
          throw new Error('API 요청 실패');
        }
        const result = await response.json();

        setData(result.aggregatedData || []);
        setTransactionData(result.transactionData || []);
        setStats(result.stats || null);

        if (result.duplicateCodes) {
          setDuplicateCodes(new Map(Object.entries(result.duplicateCodes)));
        }
      } else {
        // 배포 환경: 캐시된 데이터 사용
        const codes: CodeInfo[] = codesData;
        const transactions = cachedData.transactions;

        const aggregatedData = aggregateDataByCode(transactions, codes);
        const transactionsWithCodeNames = enrichTransactionsWithCodeNames(transactions, codes);
        const duplicates = findDuplicateCodes(codes);

        setData(aggregatedData);
        setTransactionData(transactionsWithCodeNames);
        setDuplicateCodes(duplicates);
        setStats({
          totalCodes: cachedData.totalCodes,
          totalTransactions: cachedData.totalTransactions,
          successfulFetches: cachedData.successfulFetches,
          lastUpdated: cachedData.lastUpdated,
          cached: true
        });
      }
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTransactionSort = (field: TransactionSortField) => {
    if (transactionSortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setTransactionSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                DexRP 대시보드
              </h1>
              <p className="text-gray-600">
                추천 코드별 거래 통계를 확인하세요
              </p>
            </div>
          </div>

          {stats && (
            <div className="space-y-2">
              <div className="flex gap-6 text-sm text-gray-500">
                <span>총 코드 수: {stats.totalCodes}개</span>
                <span>성공한 요청: {stats.successfulFetches}개</span>
                <span>총 거래 수: {stats.totalTransactions}건</span>
                <span>표시 중: {viewMode === 'aggregated' ? filteredData.length : filteredTransactions.length}개</span>
              </div>
              {stats.cached && stats.lastUpdated && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>💾 캐시된 데이터</span>
                  <span>•</span>
                  <span>마지막 업데이트: {new Date(stats.lastUpdated).toLocaleString('ko-KR')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {duplicateCodes.size > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ 중복 코드 발견</h3>
            <div className="space-y-2">
              {Array.from(duplicateCodes.entries()).map(([code, names]) => (
                <div key={code} className="text-sm">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{code}</span>
                  <span className="text-gray-600 ml-2">→</span>
                  <span className="ml-2 text-gray-800">{names.join(', ')}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              * 같은 코드를 사용하는 항목들은 거래 데이터가 마지막 항목에만 표시됩니다.
            </p>
          </div>
        )}

        <div className="mb-6 flex gap-4 items-center">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('aggregated')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'aggregated'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              집계 보기
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              상세 보기
            </button>
          </div>
        </div>

        {viewMode === 'aggregated' ? (
          <DataTable
            data={filteredData}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            transactionData={transactionData}
          />
        ) : (
          <TransactionTable
            data={filteredTransactions}
            sortField={transactionSortField}
            sortDirection={sortDirection}
            onSort={handleTransactionSort}
          />
        )}
      </div>
    </div>
  );
}

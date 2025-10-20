'use client';

import { useState, useEffect } from 'react';
import { AggregatedData, SortField, SortDirection } from '@/lib/types';
import { sortData, filterData } from '@/lib/aggregator';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';

export default function Home() {
  const [data, setData] = useState<AggregatedData[]>([]);
  const [filteredData, setFilteredData] = useState<AggregatedData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalAmount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ totalCodes: number; totalTransactions: number } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = filterData(data, searchTerm);
    result = sortData(result, sortField, sortDirection);
    setFilteredData(result);
  }, [data, searchTerm, sortField, sortDirection]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setStats({
          totalCodes: result.totalCodes,
          totalTransactions: result.totalTransactions
        });
      } else {
        setError('데이터를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
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
            onClick={fetchData}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DexRP 대시보드
          </h1>
          <p className="text-gray-600">
            추천 코드별 거래 통계를 확인하세요
          </p>
          {stats && (
            <div className="mt-4 flex gap-6 text-sm text-gray-500">
              <span>총 코드 수: {stats.totalCodes}개</span>
              <span>총 거래 수: {stats.totalTransactions}건</span>
              <span>표시 중: {filteredData.length}개</span>
            </div>
          )}
        </div>

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        <DataTable
          data={filteredData}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>
    </div>
  );
}

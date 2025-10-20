'use client';

import React, { useState } from 'react';
import { AggregatedData, SortField, SortDirection, TransactionWithCode } from '@/lib/types';

interface DataTableProps {
  data: AggregatedData[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  transactionData?: TransactionWithCode[];
}

export default function DataTable({ data, sortField, sortDirection, onSort, transactionData = [] }: DataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatAddress = (address: string) => {
    return address;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ko-KR');
  };

  const toggleRow = (name: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedRows(newExpanded);
  };

  const getTransactionsForCode = (codeName: string) => {
    return transactionData.filter(tx => tx.codeName === codeName);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('name')}
            >
              이름 {getSortIcon('name')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('totalAmount')}
            >
              총 금액 {getSortIcon('totalAmount')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('purchaserCount')}
            >
              구매자 수 {getSortIcon('purchaserCount')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => {
            const isExpanded = expandedRows.has(item.name);
            const transactions = getTransactionsForCode(item.name);
            const hasTransactions = transactions.length > 0;

            return (
              <React.Fragment key={index}>
                <tr
                  className={`hover:bg-gray-50 ${
                    hasTransactions ? 'cursor-pointer' : ''
                  } ${
                    isExpanded ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => hasTransactions && toggleRow(item.name)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      {hasTransactions && (
                        <span className="mr-2 text-gray-400">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      )}
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {formatAmount(item.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(item.purchaserCount)}명
                  </td>
                </tr>

                {isExpanded && hasTransactions && (
                  <tr>
                    <td colSpan={3} className="px-6 py-0 bg-gray-50">
                      <div className="py-4">
                        <div className="text-sm font-medium text-gray-700 mb-3">
                          {item.name}의 거래 내역 ({transactions.length}건)
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                                  구매자
                                </th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                                  금액
                                </th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                                  거래 시간
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {transactions.map((tx, txIndex) => (
                                <tr key={txIndex} className="text-xs">
                                  <td className="py-2 pr-4">
                                    <span className="font-mono text-gray-600 text-xs break-all">
                                      {formatAddress(tx.purchaser)}
                                    </span>
                                  </td>
                                  <td className="py-2 pr-4 font-mono text-gray-900">
                                    {formatAmount(tx.usdAmount)}
                                  </td>
                                  <td className="py-2 text-gray-600">
                                    {formatDate(tx.blockTimestamp)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}
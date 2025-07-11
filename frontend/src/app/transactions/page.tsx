"use client"

import React, { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Zap, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Powersharenavbar';
import api from '../lib/axios';

const TransactionHistoryPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalUnitsSold, setTotalUnitsSold] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/");
      return;
    }
    api.get("/energypool/transaction_history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const data = res.data as { transactions: any[]; total_transactions: number; total_units_bought: number; total_units_sold: number };
        setTransactions(data.transactions || []);
        setTotalTransactions(data.total_transactions || 0);
        setTotalUnits(data.total_units_bought || 0);
        setTotalUnitsSold(data.total_units_sold || 0);
        setIsLoading(false);
      })
      .catch(err => {
        setError(
          err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to load transactions."
        );
        setIsLoading(false);
      });
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <div className="lg:ml-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Transaction History</h2>
          <p className="text-gray-600">View and track all your energy trading transactions </p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 mb-6">{error}</div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{totalTransactions}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Energy Bought</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalUnits} Units
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Energy Sold</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalUnitsSold} Units
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-green-200">
            <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-green-100">
            {transactions.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">No transactions found.</div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.transaction_id} className={`px-6 py-4 hover:bg-green-50 transition-colors duration-200 ${transaction.role === 'sold' ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${transaction.role === 'sold' ? 'bg-blue-100' : 'bg-green-100'}`}> 
                        {transaction.role === 'sold' ? <TrendingDown className="w-5 h-5 text-blue-600" /> : <TrendingUp className="w-5 h-5 text-green-600" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          {transaction.role === 'sold' ? (
                            <>
                              <p className="font-medium text-gray-900">{transaction.user_name}</p>
                              <span className="text-gray-400">bought from your grid</span>
                              <p className="font-medium text-gray-900">{transaction.grid_name}</p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-gray-900">You</p>
                              <span className="text-gray-400">bought from</span>
                              <p className="font-medium text-gray-900">{transaction.grid_name}</p>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{formatDate(transaction.time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-gray-900">{transaction.units} </span>
                        </div>
                        <p className="text-sm text-gray-500">Units {transaction.role === 'sold' ? 'Sold' : 'Bought'}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full ${transaction.role === 'sold' ? 'bg-blue-100' : 'bg-green-100'}`}>
                        <span className={`text-sm font-medium capitalize ${transaction.role === 'sold' ? 'text-blue-700' : 'text-green-700'}`}>{transaction.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryPage; 
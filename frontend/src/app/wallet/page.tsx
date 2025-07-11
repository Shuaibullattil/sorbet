"use client"

import React, { useState, useEffect } from 'react';
import { Wallet, Coins, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Powersharenavbar';
import { useAuthGuard } from "../lib/useAuthGuard";

interface WalletData {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  recentTransactions: Array<{
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
  }>;
}

const WalletPage: React.FC = () => {
  const router = useRouter();
  const checked = useAuthGuard();
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 1250,
    totalEarned: 3200,
    totalSpent: 1950,
    recentTransactions: [
      {
        id: '1',
        type: 'credit',
        amount: 150,
        description: 'Energy sold to John Doe',
        date: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        type: 'debit',
        amount: 75,
        description: 'Energy purchased from Jane Smith',
        date: '2024-01-14T14:20:00Z'
      },
      {
        id: '3',
        type: 'credit',
        amount: 200,
        description: 'Energy sold to Mike Johnson',
        date: '2024-01-13T09:15:00Z'
      }
    ]
  });

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/");
      return;
    }
    // TODO: Fetch wallet data from API
  }, [router]);

  if (!checked) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navbar />
      
      <div className="lg:ml-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Wallet</h2>
          <p className="text-gray-600">Manage your energy trading balance and view transaction history</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-green-600">{walletData.balance}</p>
                <p className="text-sm text-gray-500">Energy Credits</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Wallet className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Earned */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Earned</p>
                <p className="text-3xl font-bold text-blue-600">{walletData.totalEarned}</p>
                <p className="text-sm text-gray-500">From Energy Sales</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-red-600">{walletData.totalSpent}</p>
                <p className="text-sm text-gray-500">On Energy Purchases</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg border border-green-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Recent Transactions</h3>
          </div>
          
          <div className="p-6">
            {walletData.recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {walletData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage; 
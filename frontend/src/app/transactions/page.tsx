"use client"

import React, { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Zap, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Powersharenavbar';

// Mock transaction data - replace with backend integration
const mockTransactions = [
  {
    id: 1,
    buyer: "Alice Johnson",
    seller: "Bob Smith",
    energyAmount: 15.5,
    tokensSpent: 155,
    timestamp: "2024-01-15T10:30:00Z",
    status: "completed"
  },
  {
    id: 2,
    buyer: "Carol Davis",
    seller: "David Wilson",
    energyAmount: 8.2,
    tokensSpent: 82,
    timestamp: "2024-01-14T14:20:00Z",
    status: "completed"
  },
  {
    id: 3,
    buyer: "Eva Brown",
    seller: "Frank Miller",
    energyAmount: 22.1,
    tokensSpent: 221,
    timestamp: "2024-01-13T09:15:00Z",
    status: "completed"
  },
  {
    id: 4,
    buyer: "Grace Lee",
    seller: "Henry Taylor",
    energyAmount: 12.8,
    tokensSpent: 128,
    timestamp: "2024-01-12T16:45:00Z",
    status: "completed"
  },
  {
    id: 5,
    buyer: "Ivy Chen",
    seller: "Jack Anderson",
    energyAmount: 18.9,
    tokensSpent: 189,
    timestamp: "2024-01-11T11:30:00Z",
    status: "completed"
  }
];

const TransactionHistoryPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (!token) {
      console.warn("No authentication token found, redirecting to login");
      router.push("/");
      return;
    }
    
    setIsLoading(false);
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

  // Show loading state while checking authentication
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Transaction History</h2>
          <p className="text-gray-600">View and track all your energy trading transactions and token spending</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{mockTransactions.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Energy Traded</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockTransactions.reduce((sum, tx) => sum + tx.energyAmount, 0).toFixed(1)} kWh
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
                <p className="text-sm font-medium text-gray-600">Total Tokens Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockTransactions.reduce((sum, tx) => sum + tx.tokensSpent, 0)}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Coins className="w-6 h-6 text-yellow-600" />
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
            {mockTransactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 hover:bg-green-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{transaction.buyer}</p>
                        <span className="text-gray-400">→</span>
                        <p className="font-medium text-gray-900">{transaction.seller}</p>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-900">{transaction.energyAmount} kWh</span>
                      </div>
                      <p className="text-sm text-gray-500">Energy Sold</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-gray-900">{transaction.tokensSpent}</span>
                      </div>
                      <p className="text-sm text-gray-500">Tokens Spent</p>
                    </div>
                    
                    <div className="bg-green-100 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-green-700 capitalize">{transaction.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backend Integration Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Backend Integration Ready</h3>
              <p className="text-sm text-blue-700 mt-1">
                This page is designed to integrate with your backend API. Replace the mock data with real API calls to fetch transaction history from your database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryPage; 
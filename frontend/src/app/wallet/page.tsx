"use client"

import React, { useState, useEffect } from 'react';
import { Wallet, Coins, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Powersharenavbar';
import { useAuthGuard } from "../lib/useAuthGuard";
import { useWallet } from '../lib/WalletContext';
import { ethers } from 'ethers';
import PowerShareAbi from '../lib/PowerShareAbi.json';
import api from "../lib/axios";

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

const TOKEN_DECIMALS = 18;
const TOKEN_SYMBOL = 'PSET';
const TOKEN_BUY_PRICE_ETH = '0.001'; // 0.001 ETH per token

const WalletPage: React.FC = () => {
  const router = useRouter();
  const checked = useAuthGuard();
  const { address, isConnected, connectWallet, disconnectWallet, error } = useWallet();
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buySuccess, setBuySuccess] = useState<string | null>(null);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellError, setSellError] = useState<string | null>(null);
  const [sellSuccess, setSellSuccess] = useState<string | null>(null);
  const [sellAmount, setSellAmount] = useState<string>('1');
  const [buyAmount, setBuyAmount] = useState<string>('1');
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

  useEffect(() => {
    if (isConnected && address) {
      fetchTokenBalance();
    }
    // eslint-disable-next-line
  }, [isConnected, address]);

  useEffect(() => {
    // Sync wallet address with backend when connected
    const syncWalletAddress = async () => {
      if (isConnected && address) {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        try {
          await api.post(
            "/user/wallet",
            { walletAddress: address },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err: any) {
          // Optionally, show error to user
          console.error("Failed to sync wallet address:", err);
        }
      }
    };
    syncWalletAddress();
    // Only run when address or isConnected changes
  }, [isConnected, address]);

  const fetchTokenBalance = async () => {
    setBuyError(null);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        PowerShareAbi,
        provider
      );
      const balance = await contract.balanceOf(address);
      setTokenBalance(ethers.formatUnits(balance, TOKEN_DECIMALS));
    } catch (err: any) {
      setBuyError('Failed to fetch token balance.');
    }
  };

  const handleBuyTokens = async () => {
    setBuyLoading(true);
    setBuyError(null);
    setBuySuccess(null);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        PowerShareAbi,
        signer
      );
      // Calculate ETH to send: amount * 0.001
      const ethValue = (Number(buyAmount) * Number(TOKEN_BUY_PRICE_ETH)).toString();
      const tx = await contract.buyTokens({ value: ethers.parseEther(ethValue) });
      await tx.wait();
      setBuySuccess('Tokens purchased successfully!');
      fetchTokenBalance();
    } catch (err: any) {
      setBuyError(err.message || 'Failed to buy tokens.');
    } finally {
      setBuyLoading(false);
    }
  };

  const handleSellTokens = async () => {
    setSellLoading(true);
    setSellError(null);
    setSellSuccess(null);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        PowerShareAbi,
        signer
      );
      const tx = await contract.sellTokens(ethers.parseUnits(sellAmount, TOKEN_DECIMALS));
      await tx.wait();
      setSellSuccess('Tokens sold successfully!');
      fetchTokenBalance();
    } catch (err: any) {
      setSellError(err.message || 'Failed to sell tokens.');
    } finally {
      setSellLoading(false);
    }
  };

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

        {/* Wallet Connection Status and Actions */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0">
          {isConnected ? (
            <>
              <div className="text-green-700 text-sm font-semibold">Connected Wallet: <span className="font-mono">{address}</span></div>
              <button
                onClick={disconnectWallet}
                className="px-3 py-2 bg-red-200 text-red-700 rounded hover:bg-red-300 text-xs font-semibold mt-2 md:mt-0"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold"
            >
              Connect Wallet
            </button>
          )}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>

        {/* Token Balance and Buy/Sell Buttons */}
        {isConnected && (
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 flex flex-col items-start">
              <span className="text-sm text-gray-600 mb-1">PowerShare Token Balance</span>
              <span className="text-2xl font-bold text-green-600">{tokenBalance} {TOKEN_SYMBOL}</span>
            </div>
            {/* Buy tokens UI */}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={buyAmount}
                onChange={e => setBuyAmount(e.target.value)}
                className="w-20 px-2 py-1 border border-green-300 rounded text-lg"
                disabled={buyLoading}
              />
              <span className="text-gray-700">PSET</span>
              <span className="text-gray-500">=</span>
              <span className="text-green-700 font-semibold">{Number(buyAmount) * Number(TOKEN_BUY_PRICE_ETH)} ETH</span>
              <button
                onClick={handleBuyTokens}
                disabled={buyLoading || Number(buyAmount) <= 0 || isNaN(Number(buyAmount))}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 disabled:opacity-50"
              >
                {buyLoading ? 'Processing...' : `Buy PowerShare Tokens`}
              </button>
            </div>
            {/* Sell tokens UI */}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max={tokenBalance}
                value={sellAmount}
                onChange={e => setSellAmount(e.target.value)}
                className="w-20 px-2 py-1 border border-green-300 rounded text-lg"
                disabled={sellLoading}
              />
              <button
                onClick={handleSellTokens}
                disabled={sellLoading || Number(sellAmount) <= 0 || Number(sellAmount) > Number(tokenBalance)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 disabled:opacity-50"
              >
                {sellLoading ? 'Processing...' : `Sell PowerShare Tokens`}
              </button>
            </div>
            {/* Show errors and success for buy/sell */}
            <div className="flex flex-col space-y-1">
              {buyError && <span className="text-red-600 text-sm">{buyError}</span>}
              {buySuccess && <span className="text-green-600 text-sm">{buySuccess}</span>}
              {sellError && <span className="text-red-600 text-sm">{sellError}</span>}
              {sellSuccess && <span className="text-green-600 text-sm">{sellSuccess}</span>}
            </div>
          </div>
        )}

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
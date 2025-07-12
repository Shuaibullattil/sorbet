'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if wallet was previously connected
    const previouslyConnected = localStorage.getItem('walletConnected');
    if (previouslyConnected) {
      connectWallet();
    }
    // eslint-disable-next-line
  }, []);

  const connectWallet = async () => {
    setError(null);
    if (!(window as any).ethereum) {
      setError('MetaMask is not installed.');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        localStorage.setItem('walletConnected', 'true');
      } else {
        setError('No accounts found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet.');
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setError(null);
    localStorage.removeItem('walletConnected');
  };

  return (
    <WalletContext.Provider value={{ address, isConnected, connectWallet, disconnectWallet, error }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 
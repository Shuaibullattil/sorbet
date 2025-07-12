"use client";
import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import api from "../lib/axios";
import { useWallet } from '../lib/WalletContext';
import { ethers } from 'ethers';
import PowerShareAbi from '../lib/PowerShareAbi.json';

interface EnergyPool {
  grid_id: string;
  grid_name: string;
  location: { latitude: number; longitude: number };
  units_for_sell: number;
  user: string;
  user_name: string;
}

interface BuyEnergyModalProps {
  open: boolean;
  onClose: () => void;
  pool: EnergyPool | null;
  onSuccess?: () => void;
}

const TOKEN_DECIMALS = 18;
const TOKEN_SYMBOL = 'PSET';

const BuyEnergyModal: React.FC<BuyEnergyModalProps> = ({ open, onClose, pool, onSuccess }) => {
  const [units, setUnits] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const { address, isConnected } = useWallet();

  React.useEffect(() => {
    if (open) {
      setUnits(1);
      setError(null);
      setSuccessMsg(null);
      setLoading(false);
      setShowAnimation(false);
    }
  }, [open, pool]);

  if (!pool) return null;

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setShowAnimation(false);
    if (!isConnected || !address) {
      setError('Please connect your wallet.');
      setLoading(false);
      return;
    }
    try {
      // 1. Transfer tokens to seller (pool.user is assumed to be wallet address)
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        PowerShareAbi,
        signer
      );
      // Calculate token amount (1 unit = 1 token)
      const tokenAmount = ethers.parseUnits(units.toString(), TOKEN_DECIMALS);
      // Transfer tokens to seller
      const tx = await contract.transfer(pool.user, tokenAmount);
      await tx.wait();
      // 2. Call backend API to record transaction
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await api.post(
        "/energypool/buy",
        { grid_id: pool.grid_id, units },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAnimation(true);
      setLoading(false);
      setTimeout(() => {
        const data = res.data as { message?: string };
        setShowAnimation(false);
        setSuccessMsg(data.message || "Purchase successful!");
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to buy energy units.");
      setLoading(false);
    }
  };

  return (
    <Transition appear show={open} as={React.Fragment}>
      <Dialog as="div" className="fixed inset-0 z-[100] overflow-y-auto" onClose={onClose}>
        {/* Blur background */}
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-[99]" aria-hidden="true" />
        <div className="flex min-h-full items-center justify-center p-4 text-center z-[100]">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all relative z-[101]">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Buy Energy from {pool.grid_name}</h2>
                <p className="text-gray-600">by {pool.user_name}</p>
              </div>
              {showAnimation ? (
                <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                  <div className="w-20 h-20 flex items-center justify-center mb-4">
                    {/* Animated energy transfer bolt */}
                    <svg className="w-16 h-16 text-green-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="w-full h-3 bg-green-100 rounded-full overflow-hidden mb-4">
                    <div className="h-3 bg-gradient-to-r from-green-400 to-green-600 animate-energy-bar" style={{ width: '100%' }} />
                  </div>
                  <p className="text-green-700 font-semibold mt-2 animate-pulse">Transferring energy units...</p>
                </div>
              ) : successMsg ? (
                <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-green-700 mb-2">Success!</h3>
                  <p className="text-gray-600 mb-4">{successMsg}</p>
                  <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form className="space-y-6 animate-fade-in" onSubmit={handleBuy}>
                  <div className="flex justify-between items-center bg-green-50 rounded-lg p-4 mb-2">
                    <span className="text-gray-700 font-medium">Available Units:</span>
                    <span className="font-bold text-green-800 text-lg">{pool.units_for_sell}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-0">Units to Buy</label>
                    <input
                      type="number"
                      value={units}
                      onChange={e => setUnits(Math.max(1, Math.min(pool.units_for_sell, Number(e.target.value))))}
                      className="flex-1 border-2 border-green-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors text-lg"
                      min={1}
                      max={pool.units_for_sell}
                      placeholder="Enter units to buy"
                      required
                      disabled={loading}
                      style={{ maxWidth: 120 }}
                    />
                    <button
                      type="submit"
                      className="ml-2 flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 text-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Buying...
                        </span>
                      ) : (
                        "Buy"
                      )}
                    </button>
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
        {/* Animation for energy bar */}
        <style>{`
          @keyframes energy-bar {
            0% { width: 0; }
            100% { width: 100%; }
          }
          .animate-energy-bar {
            animation: energy-bar 2s linear forwards;
          }
        `}</style>
      </Dialog>
    </Transition>
  );
};

export default BuyEnergyModal; 
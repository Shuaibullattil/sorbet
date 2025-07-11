// Navbar Component
"use client"

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, User, Wallet, Zap, TrendingUp, TrendingDown, Battery, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation'

const Navbar: React.FC = () => {

const router = useRouter();
  const handleNavigation = (path: string): void => {
    console.log(`Navigating to: ${path}`);
    router.push(path);
  };

  return (
    <nav className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-600 p-2 rounded-lg">
            <Zap className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">PowerShare</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleNavigation('/wallet')}
            className="p-2 rounded-lg bg-white hover:bg-green-50 transition-colors duration-200 shadow-sm border border-green-200"
            title="Wallet"
          >
            <Wallet className="w-5 h-5 text-green-600" />
          </button>
          
          <button 
            onClick={() => handleNavigation('/notifications')}
            className="p-2 rounded-lg bg-white hover:bg-green-50 transition-colors duration-200 shadow-sm border border-green-200 relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-green-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
          
          <button 
            onClick={() => handleNavigation('/profile')}
            className="p-2 rounded-lg bg-white hover:bg-green-50 transition-colors duration-200 shadow-sm border border-green-200"
            title="Profile"
          >
            <User className="w-5 h-5 text-green-600" />
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors duration-200 shadow-sm border border-red-200 text-red-600 font-semibold"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
export default Navbar;
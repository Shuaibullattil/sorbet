// Sidebar Component
"use client"

import React, { useState } from 'react';
import { Bell, User, Wallet, Zap, History, LayoutDashboard, Menu, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation'
import { useWallet } from '../lib/WalletContext';

const Sidebar: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { address, isConnected, connectWallet, disconnectWallet, error } = useWallet();

  const handleNavigation = (path: string): void => {
    console.log(`Navigating to: ${path}`);
    router.push(path);
    setIsOpen(false); // Close sidebar on mobile after navigation
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const navigationItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/transactions', icon: History, label: 'Transactions' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-green-600 text-white shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-green-50 to-emerald-50 
        border-r border-green-200 shadow-lg z-30 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo section */}
        <div className="p-6 border-b border-green-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Zap className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">PowerShare</h1>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg bg-white hover:bg-green-50 
                         transition-colors duration-200 shadow-sm border border-green-200 text-left"
              title={item.label}
            >
              <item.icon className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">{item.label}</span>
              {item.path === '/notifications' && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              )}
            </button>
          ))}
          {/* Wallet connect section */}
          <div className="mt-6 p-3 bg-green-100 rounded-lg flex flex-col items-start space-y-2 border border-green-200">
            {isConnected ? (
              <>
                <span className="text-green-700 text-xs font-semibold">Wallet Connected</span>
                <span className="text-xs break-all">{address}</span>
                <button
                  onClick={disconnectWallet}
                  className="mt-1 px-2 py-1 text-xs bg-red-200 text-red-700 rounded hover:bg-red-300"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold"
              >
                Connect Wallet
              </button>
            )}
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        </nav>

        {/* Logout button at bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-red-100 hover:bg-red-200 
                     transition-colors duration-200 shadow-sm border border-red-200 text-red-600 font-semibold"
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content margin for desktop */}
      <div className="lg:ml-64">
        {/* This div ensures content doesn't overlap with sidebar on desktop */}
      </div>
    </>
  );
};

export { Sidebar as Navbar };
export default Sidebar;
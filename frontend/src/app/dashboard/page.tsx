"use client"

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, User, Wallet, Zap, TrendingUp, TrendingDown, Battery, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation'
import SellEnergyModal from "../components/SellEnergyModal";
import api from "../lib/axios";
import Navbar from "../components/Powersharenavbar";

// Type definitions
interface EnergyData {
  month: string;
  bought: number;
  sold: number;
}

interface ColorClasses {
  text: string;
  bg: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  color?: 'green' | 'blue' | 'orange' | 'red';
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// Mock data for the chart
const energyData: EnergyData[] = [
  { month: 'Jan', bought: 45, sold: 30 },
  { month: 'Feb', bought: 52, sold: 38 },
  { month: 'Mar', bought: 48, sold: 42 },
  { month: 'Apr', bought: 61, sold: 55 },
  { month: 'May', bought: 55, sold: 48 },
  { month: 'Jun', bought: 67, sold: 62 },
  { month: 'Jul', bought: 43, sold: 38 },
  { month: 'Aug', bought: 58, sold: 52 },
  { month: 'Sep', bought: 64, sold: 59 },
  { month: 'Oct', bought: 71, sold: 65 },
  { month: 'Nov', bought: 69, sold: 63 },
  { month: 'Dec', bought: 75, sold: 68 }
];

// Reusable Card Component
const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 border border-green-100 ${className}`}>
    {children}
  </div>
);

// Reusable Stat Card Component
const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color = "green" }) => {
  const getColorClasses = (color: string): ColorClasses => {
    const colorMap: Record<string, ColorClasses> = {
      green: { text: 'text-green-600', bg: 'bg-green-100' },
      blue: { text: 'text-blue-600', bg: 'bg-blue-100' },
      orange: { text: 'text-orange-600', bg: 'bg-orange-100' },
      red: { text: 'text-red-600', bg: 'bg-red-100' }
    };
    return colorMap[color] || colorMap.green;
  };

  const colors = getColorClasses(color);

  return (
    <Card className="hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    </Card>
  );
};

<Navbar/>

// Chart Component
const EnergyChart: React.FC = () => (
  <Card className="col-span-2">
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Energy Trading Overview</h2>
      <p className="text-gray-600 text-sm">Monthly energy units bought and sold</p>
    </div>
    
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={energyData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="bought" 
          stroke="#dc2626" 
          strokeWidth={3}
          name="Units Bought"
          dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#dc2626', strokeWidth: 2 }}
        />
        <Line 
          type="monotone" 
          dataKey="sold" 
          stroke="#16a34a" 
          strokeWidth={3}
          name="Units Sold"
          dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

// Main Dashboard Component
const PowerShareDashboard: React.FC = () => {
  const [remainingTokens] = useState<number>(1250);
  const [availableUnits, setAvailableUnits] = useState<number>(85);
  const [unitsForSell, setUnitsForSell] = useState<number>(42);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const router = useRouter();

  // Helper function to extract error message safely
  const extractErrorMessage = (err: any): string => {
    try {
      const errData = err.response?.data;
      
      // If it's a string, return it directly
      if (typeof errData === "string") {
        return errData;
      }
      
      // Check for common error message fields
      if (errData?.detail && typeof errData.detail === 'string') {
        return errData.detail;
      }
      
      if (errData?.message && typeof errData.message === 'string') {
        return errData.message;
      }
      
      // Handle validation errors (array format)
      if (Array.isArray(errData) && errData.length > 0) {
        const firstError = errData[0];
        if (firstError?.msg && typeof firstError.msg === 'string') {
          return firstError.msg;
        }
        if (typeof firstError === 'string') {
          return firstError;
        }
      }
      
      // Handle single validation error object
      if (errData?.msg && typeof errData.msg === 'string') {
        return errData.msg;
      }
      
      // Fallback to generic error message
      return err.message || "An unexpected error occurred while refreshing data.";
    } catch (parseError) {
      return "Failed to parse error response.";
    }
  };

  // Function to refresh dashboard data after selling
  const refreshUnits = async () => {
    try {
      setRefreshError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      if (!token) {
        console.warn("No authentication token found");
        return;
      }
      
      const res = await api.get("/grid/get_unit_status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = res.data as { units: number; units_for_sell: number };
      setAvailableUnits(data.units);
      setUnitsForSell(data.units_for_sell);
      
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      setRefreshError(errorMessage);
      console.error("Error refreshing units:", errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
          <p className="text-gray-600">Monitor your energy trading activity and manage your green energy portfolio</p>
        </div>
        
        {/* Display refresh error if any */}
        {refreshError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">Error refreshing data: {refreshError}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <EnergyChart />
          </div>
          {/* Stats Section */}
          <div className="space-y-6">
            <div className='flex items-center justify-between'>
              <button 
                onClick={() => router.push('/mygrid')}
                className='p-8 bg-yellow-400 text-white hover:bg-yellow-500 rounded-3xl font-bold transition-colors duration-200'
              >
                MY POWER GRID
              </button>
            </div>
            <StatCard 
              title="Available Units" 
              value={availableUnits} 
              icon={TrendingUp}
              trend={12.3}
              color="green"
            />
            <StatCard 
              title="Units for Sale" 
              value={unitsForSell} 
              icon={TrendingDown}
              trend={-5.7}
              color="orange"
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 flex gap-4">
            <button 
              onClick={() => {
                console.log('Buy Energy clicked');
                // Add buy logic here
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Buy Energy
            </button>
            <button 
              onClick={() => setSellModalOpen(true)}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Sell Energy
            </button>
          </div>
        </div>
      </div>
      
      <SellEnergyModal 
        open={sellModalOpen} 
        onClose={() => setSellModalOpen(false)} 
        onSuccess={refreshUnits} 
      />
    </div>
  );
};

export default PowerShareDashboard;
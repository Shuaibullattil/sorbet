"use client"

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, User, Wallet, Zap, TrendingUp, TrendingDown, Battery, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation'
import Navbar from "../components/Powersharenavbar";
import SellEnergyModal from "../components/SellEnergyModal";
import api from "../lib/axios";
import { useAuthGuard } from "../lib/useAuthGuard";

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

// Chart Component with real data
const EnergyChart: React.FC<{ data: EnergyData[] }> = ({ data }) => (
  <Card className="col-span-2">
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Energy Trading Overview</h2>
      <p className="text-gray-600 text-sm">Monthly energy units bought and sold</p>
    </div>
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
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
  const checked = useAuthGuard();
  const [remainingTokens] = useState<number>(1250);
  const [availableUnits, setAvailableUnits] = useState<number>(0);
  const [unitsForSell, setUnitsForSell] = useState<number>(0);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const router = useRouter();

  // Fetch units from API
  const fetchUnits = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      const res = await api.get("/grid/get_unit_status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data as { units: number; units_for_sell: number };
      setAvailableUnits(data.units);
      setUnitsForSell(data.units_for_sell);
    } catch (err) {
      // Optionally handle error
    }
  };

  // Fetch energy summary for chart
  const fetchEnergySummary = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      const res = await api.get("/energypool/monthly_energy_summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnergyData(res.data as EnergyData[]);
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchUnits();
    fetchEnergySummary();
  }, []);

  // Optionally, add a function to refresh dashboard data after selling
  const refreshUnits = async () => {
    await fetchUnits();
  };

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      <div className="lg:ml-64 p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
          <p className="text-gray-600">Monitor your energy trading activity and manage your green energy portfolio</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <EnergyChart data={energyData} />
          </div>
          {/* Stats Section */}
          <div className="space-y-6">
            <div className='flex items-center justify-between'>
              <div className="relative group">
                {/* Animated background glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-3xl blur opacity-60 group-hover:opacity-100 animate-pulse"></div>
                
                {/* Moving light effect */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 animate-shimmer"></div>
                </div>
                
                {/* Main button */}
                <button 
                  onClick={() => router.push('/mygrid')}
                  className="relative px-8 py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-white font-bold rounded-3xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group-hover:shadow-yellow-500/50"
                >
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-300 via-transparent to-yellow-300 opacity-50"></div>
                  
                  {/* Button text with enhanced styling */}
                  <span className="relative z-10 text-white font-extrabold text-lg tracking-wide drop-shadow-md">
                    ⚡ MY POWER GRID ⚡
                  </span>
                </button>
              </div>
            </div>
            <StatCard 
              title="Available Units" 
              value={availableUnits} 
              icon={TrendingUp}
              color="green"
            />
            <StatCard 
              title="Units for Sale" 
              value={unitsForSell} 
              icon={TrendingDown}
              color="blue"
            />
          </div>
        </div>
        {/* Action Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 flex gap-4">
            <button 
              onClick={() => {router.push('/buy_energy')}}
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
      <SellEnergyModal open={sellModalOpen} onClose={() => setSellModalOpen(false)} onSuccess={refreshUnits} />
    </div>
  );
};

export default PowerShareDashboard;
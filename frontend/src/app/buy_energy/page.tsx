"use client";
import Navbar from "../components/Powersharenavbar";
import { useAuthGuard } from "../lib/useAuthGuard";
import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import dynamic from "next/dynamic";
import BuyEnergyModal from "./BuyEnergyModal";

const MapWithMarkers = dynamic(() => import("./MapWithMarkers"), { ssr: false });

interface EnergyPool {
  grid_id: string;
  grid_name: string;
  location: { latitude: number; longitude: number };
  units_for_sell: number;
  user: string;
  user_name: string;
}

export default function BuyEnergyPage() {
  const checked = useAuthGuard();
  const [pools, setPools] = useState<EnergyPool[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [poolToBuy, setPoolToBuy] = useState<EnergyPool | null>(null);

  useEffect(() => {
    if (!checked) return;
    setLoading(true);
    setError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    api.get("/energypool/", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setPools(res.data as EnergyPool[]);
        setLoading(false);
      })
      .catch(err => {
        setError(
          err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to load energy pools."
        );
        setLoading(false);
      });
  }, [checked]);

  // Get user's geolocation for map centering
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => setUserLocation(null)
      );
    }
  }, []);

  if (!checked) return null;

  const handleBuyClick = (pool: EnergyPool) => {
    setPoolToBuy(pool);
    setBuyModalOpen(true);
  };

  const refreshPools = () => {
    setLoading(true);
    setError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    api.get("/energypool/", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setPools(res.data as EnergyPool[]);
        setLoading(false);
      })
      .catch(err => {
        setError(
          err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to load energy pools."
        );
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: List of Energy Pools */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Energy Pools</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">{error}</div>
          ) : pools.length === 0 ? (
            <div className="text-gray-500">No energy pools available for purchase.</div>
          ) : (
            <ul className="space-y-3">
              {pools.map(pool => (
                <li
                  key={pool.grid_id}
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg ${selected === pool.grid_id ? "border-green-500 bg-green-50" : "border-green-100 bg-white"}`}
                  onClick={() => setSelected(pool.grid_id)}
                >
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-green-800 leading-tight">{pool.grid_name}</span>
                    <span className="text-sm text-gray-500 mt-1">by {pool.user_name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-extrabold text-green-700">{pool.units_for_sell}</span>
                    <span className="text-xs text-gray-400 mt-1">Units for Sale</span>
                    <button
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow hover:from-green-600 hover:to-green-700 transition-all duration-300"
                      onClick={e => { e.stopPropagation(); handleBuyClick(pool); }}
                    >
                      Buy
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Right: Map with Markers */}
        <div className="h-[500px] rounded-2xl shadow-xl border border-green-100 bg-white p-4 flex flex-col">
          <h2 className="text-xl font-bold text-green-700 mb-4">Map of Energy Pools</h2>
          <div className="flex-1">
            <MapWithMarkers pools={pools} selected={selected} setSelected={setSelected} userLocation={userLocation} />
          </div>
        </div>
      </div>
      <BuyEnergyModal open={buyModalOpen} onClose={() => setBuyModalOpen(false)} pool={poolToBuy} onSuccess={refreshPools} />
    </div>
  );
}

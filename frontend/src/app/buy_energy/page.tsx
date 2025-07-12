"use client";
import Navbar from "../components/Powersharenavbar";
import { useAuthGuard } from "../lib/useAuthGuard";
import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import dynamic from "next/dynamic";
import BuyEnergyModal from "./BuyEnergyModal";
import { MapPin } from "lucide-react";

const MapWithMarkers = dynamic(() => import("./MapWithMarkers"), { ssr: false });

interface EnergyPool {
  grid_id: string;
  grid_name: string;
  location: { latitude: number; longitude: number };
  units_for_sell: number;
  user: string;
  user_name: string;
}

// Haversine formula to calculate distance between two lat/lng points in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
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
      <div className="lg:ml-64 max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
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
            <ul className="space-y-4">
              {(() => {
                // Calculate distances and sort pools
                const poolsWithDistance = pools.map(pool => {
                  let distance = null;
                  if (userLocation) {
                    distance = getDistanceFromLatLonInKm(
                      userLocation[0],
                      userLocation[1],
                      pool.location.latitude,
                      pool.location.longitude
                    );
                  }
                  return { ...pool, distance };
                });
                poolsWithDistance.sort((a, b) => {
                  if (a.distance === null) return 1;
                  if (b.distance === null) return -1;
                  return a.distance - b.distance;
                });
                return poolsWithDistance.map(pool => (
                  <li
                    key={pool.grid_id}
                    className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg bg-white hover:bg-green-50 ${selected === pool.grid_id ? "border-green-500 ring-2 ring-green-200" : "border-green-100"}`}
                    onClick={() => setSelected(pool.grid_id)}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xl font-bold text-green-800 leading-tight flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-500" />
                        {pool.grid_name}
                      </span>
                      <span className="text-sm text-gray-500">by {pool.user_name}</span>
                      {pool.distance !== null && (
                        <span className="flex items-center gap-1 text-xs text-green-700 mt-1 font-medium">
                          <MapPin className="w-4 h-4 text-green-400" />
                          {pool.distance.toFixed(2)} km away
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-2xl font-extrabold text-green-700">{pool.units_for_sell}</span>
                      <span className="text-xs text-gray-400">Units for Sale</span>
                      <button
                        className="mt-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow hover:from-green-600 hover:to-green-700 transition-all duration-300"
                        onClick={e => { e.stopPropagation(); handleBuyClick(pool); }}
                      >
                        Buy
                      </button>
                    </div>
                  </li>
                ));
              })()}
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

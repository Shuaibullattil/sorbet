"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "../components/Powersharenavbar";
import { useRouter } from "next/navigation";
const UserGridMap = dynamic(() => import("./UserGridMap"), { ssr: false });
import api from "../lib/axios";
import { Dialog } from "@headlessui/react";

interface GridData {
  _id: string;
  "grid name": string;
  user: string;
  location: { latitude: number; longitude: number };
  units: number;
  available: boolean;
}

interface UpdateUnitsResponse {
  message: string;
  units: number;
}

export default function MyGridPage() {
  const router = useRouter();
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    units: 0,
  });
  const hardcodedPrice = 7.5;
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchGrid = async () => {
      setLoading(true);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.replace("/");
        return;
      }
      try {
        const res = await api.get<GridData>("/grid/get_user_grid", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data) {
          setGridData(res.data);
          setForm({
            units: res.data.units,
          });
        } else {
          setGridData(null);
        }
      } catch (err: any) {
        setError("Failed to load grid data");
        setGridData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchGrid();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/");
      return;
    }
    try {
      const res = await api.post<UpdateUnitsResponse>(
        `/grid/update_units?units=${form.units}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data && res.data.units !== undefined) {
        setGridData(prev => prev && { ...prev, units: res.data.units });
        setSuccessMsg(res.data.message || "Units updated successfully");
        setShowSuccess(true);
        setEditMode(false);
      }
    } catch (err) {
      setSuccessMsg("Failed to update units");
      setShowSuccess(true);
    }
  };

  const handleCreate = () => {
    // TODO: Implement create grid logic if needed
    setGridData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">My Power Grid</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Grid Data */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100 flex flex-col justify-between min-h-[350px]">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Loading grid data...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500">{error}</div>
            ) : gridData ? (
              <>
                <div>
                  <h3 className="text-xl font-semibold text-green-700 mb-4">{gridData["grid name"]}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Units:</span>
                      {editMode ? (
                        <input
                          type="number"
                          name="units"
                          value={form.units}
                          onChange={handleInputChange}
                          className="border rounded px-2 py-1 w-24 text-right"
                          min={0}
                        />
                      ) : (
                        <span className="font-bold text-green-800">{gridData.units}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-bold text-green-800">{gridData.available ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Price / Unit:</span>
                      <span className="font-bold text-green-800">₹{hardcodedPrice}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex gap-4">
                  {editMode ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
                    >
                      Update
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg text-gray-700 mb-4">No grid data found.</p>
                <button
                  onClick={handleCreate}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                >
                  Create Your Power Grid
                </button>
              </div>
            )}
          </div>

          {/* Right: Map */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-green-100 min-h-[350px] flex flex-col">
            <h3 className="text-lg font-semibold text-green-700 mb-2">Grid Location</h3>
            <div className="flex-1 rounded-lg overflow-hidden">
              {gridData && gridData.location ? (
                <UserGridMap position={{ lat: gridData.location.latitude, lng: gridData.location.longitude }} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 bg-green-50 rounded-lg border border-dashed border-green-200">
                  <span>Map will appear here (Install <code>react-leaflet</code> and <code>leaflet</code> for full functionality)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Success Popup */}
      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="relative bg-white rounded-xl shadow-xl p-8 max-w-sm mx-auto flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">{successMsg}</h2>
          <button
            onClick={() => setShowSuccess(false)}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Close
          </button>
        </div>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "../components/Powersharenavbar";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "../lib/useAuthGuard";
const UserGridMap = dynamic(() => import("./UserGridMap"), { ssr: false });
import api from "../lib/axios";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

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

interface ApiErrorResponse {
  detail: string;
}

export default function MyGridPage() {
  const checked = useAuthGuard();
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
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    grid_name: "",
    units: 0,
    latitude: 9.9312,
    longitude: 76.2673,
    available: true,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [hasGrid, setHasGrid] = useState<boolean | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null); // Add for geolocation errors

  // Helper to get current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    setGeoError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCreateForm((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
          setLocationLoading(false);
        },
        (error) => {
          let msg = "Failed to get your location.";
          if (error.code === 1) msg = "Location permission denied.";
          else if (error.code === 2) msg = "Location unavailable.";
          else if (error.code === 3) msg = "Location request timed out.";
          setGeoError(msg);
          setLocationLoading(false);
        }
      );
    } else {
      setGeoError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
    }
  };

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
        const res = await api.get<GridData | ApiErrorResponse>("/grid/get_user_grid", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Check if response contains error detail
        if (res.data && 'detail' in res.data) {
          setHasGrid(false);
          setGridData(null);
        } else {
          const data = res.data as GridData;
          setGridData(data);
          setHasGrid(true);
          setForm({
            units: data.units,
          });
        }
      } catch (err: any) {
        console.error("Fetch grid error:", err);
        if (err.response?.data?.detail === "Grid not found for this user") {
          setHasGrid(false);
          setGridData(null);
        } else {
          let errorMessage = "Failed to load grid data";
          if (err.response?.data?.detail) {
            errorMessage = err.response.data.detail;
          } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          setHasGrid(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchGrid();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
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
    } catch (err: any) {
      console.error("Update units error:", err);
      let errorMessage = "Failed to update units";
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setSuccessMsg(errorMessage);
      setShowSuccess(true);
    }
  };

  const handleCreateGrid = async () => {
    setCreateLoading(true);
    setCreateError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/");
      return;
    }
    // Frontend validation
    if (!createForm.grid_name.trim()) {
      setCreateError("Grid name is required.");
      setCreateLoading(false);
      return;
    }
    if (createForm.units < 0) {
      setCreateError("Units cannot be negative.");
      setCreateLoading(false);
      return;
    }
    try {
      const res = await api.post(
        "/grid/insert_new",
        {
          grid_name: createForm.grid_name,
          location: {
            latitude: createForm.latitude,
            longitude: createForm.longitude,
          },
          units: createForm.units,
          available: createForm.available,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowCreate(false);
      setSuccessMsg("Grid created successfully! 🎉");
      setShowSuccess(true);
      setHasGrid(true);
      // Refetch grid data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error("Create grid error:", err);
      let errorMessage = "Failed to create grid";
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setCreateError(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      grid_name: "",
      units: 0,
      latitude: 9.9312,
      longitude: 76.2673,
      available: true,
    });
    setCreateError(null);
    setGeoError(null);
  };

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Power Grid</h1>
          <p className="text-gray-600">Manage your renewable energy distribution network</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
              <div className="mt-4 text-center text-gray-600">Loading your grid data...</div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">⚠️ Error Loading Grid</div>
            <p className="text-red-700">{error}</p>
          </div>
        ) : hasGrid === false ? (
          // No grid found - show create button
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-green-100">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Power Grid Found</h2>
              <p className="text-gray-600 mb-8">Create your first power grid to start sharing renewable energy with your community</p>
            </div>
            <button
              onClick={() => {
                resetCreateForm();
                setShowCreate(true);
              }}
              className="group bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your Power Grid
              </span>
            </button>
          </div>
        ) : (
          // Grid exists - show grid data
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Grid Data */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-700">{gridData?.["grid name"]}</h3>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Available Units:</span>
                  {editMode ? (
                    <input
                      type="number"
                      name="units"
                      value={form.units}
                      onChange={handleInputChange}
                      className="border-2 border-green-300 rounded-lg px-3 py-2 w-24 text-right focus:border-green-500 focus:outline-none transition-colors"
                      min={0}
                    />
                  ) : (
                    <span className="font-bold text-green-800 text-lg">{gridData?.units}</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Status:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${gridData?.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-bold text-green-800">{gridData?.available ? "Available" : "Unavailable"}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Price per Unit:</span>
                  <span className="font-bold text-green-800 text-lg">₹{hardcodedPrice}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                {editMode ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    ✏️ Update Grid
                  </button>
                )}
              </div>
            </div>

            {/* Right: Map */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-700">Grid Location</h3>
              </div>
              
              <div className="h-80 rounded-xl overflow-hidden border-2 border-green-100">
                {gridData?.location ? (
                  <UserGridMap position={{ lat: gridData.location.latitude, lng: gridData.location.longitude }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-dashed border-green-200">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="text-sm">Map will appear here</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <Transition appear show={showSuccess} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowSuccess(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Success!</h2>
                    <p className="text-gray-600 mb-6">{successMsg}</p>
                    <button
                      onClick={() => setShowSuccess(false)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
                    >
                      Continue
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Create Grid Modal */}
      <Transition appear show={showCreate} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowCreate(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Power Grid</h2>
                    <p className="text-gray-600">Set up your renewable energy sharing network</p>
                  </div>

                  <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleCreateGrid(); }}>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Grid Name</label>
                      <input
                        type="text"
                        value={createForm.grid_name}
                        onChange={e => setCreateForm(f => ({ ...f, grid_name: e.target.value }))}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors"
                        placeholder="e.g., Solar Farm Alpha"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Available Units</label>
                      <input
                        type="number"
                        value={createForm.units}
                        onChange={e => setCreateForm(f => ({ ...f, units: Number(e.target.value) }))}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors"
                        min={0}
                        placeholder="Enter available units"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <input
                            type="number"
                            value={createForm.latitude}
                            onChange={e => setCreateForm(f => ({ ...f, latitude: Number(e.target.value) }))}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors"
                            placeholder="Latitude"
                            step="any"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={createForm.longitude}
                            onChange={e => setCreateForm(f => ({ ...f, longitude: Number(e.target.value) }))}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors"
                            placeholder="Longitude"
                            step="any"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="w-full bg-blue-50 text-blue-700 border-2 border-blue-200 px-4 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-all duration-300 disabled:opacity-50"
                      >
                        {locationLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            Getting Location...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Use My Current Location
                          </span>
                        )}
                      </button>
                      {geoError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                          <p className="text-red-700 text-xs">{geoError}</p>
                        </div>
                      )}
                      {/* Map Preview for Location Selection */}
                      <div className="mt-4 h-48 rounded-xl overflow-hidden border-2 border-green-100">
                        <UserGridMap position={{ lat: createForm.latitude, lng: createForm.longitude }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={createForm.available}
                        onChange={e => setCreateForm(f => ({ ...f, available: e.target.checked }))}
                        id="available"
                        className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="available" className="text-sm font-medium text-gray-700">
                        Make grid available for energy sharing
                      </label>
                    </div>

                    {createError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-700 text-sm">{createError}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowCreate(false)}
                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                        disabled={createLoading}
                      >
                        {createLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating...
                          </span>
                        ) : (
                          "Create Grid"
                        )}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
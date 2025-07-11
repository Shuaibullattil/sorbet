"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "../components/Powersharenavbar";
const UserGridMap = dynamic(() => import("./UserGridMap"), { ssr: false });

// Mock grid data (replace with API call as needed)
const mockGridData = {
  name: "Kochi Solar Grid",
  availableUnits: 120,
  unitsForSale: 40,
  unitPrice: 7.5, // per unit
  location: { lat: 9.9312, lng: 76.2673 }, // Kochi
};

export default function MyGridPage() {
  // Set to null to simulate no grid data
  const [gridData, setGridData] = useState(mockGridData); // or null
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    availableUnits: gridData?.availableUnits || 0,
    unitPrice: gridData?.unitPrice || 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    setGridData(prev => prev && { ...prev, ...form });
    setEditMode(false);
  };

  const handleCreate = () => {
    // In real app, show a modal or redirect to create page
    setGridData({
      name: "New Power Grid",
      availableUnits: 0,
      unitsForSale: 0,
      unitPrice: 0,
      location: { lat: 9.9312, lng: 76.2673 },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">My Power Grid</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Grid Data */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100 flex flex-col justify-between min-h-[350px]">
            {gridData ? (
              <>
                <div>
                  <h3 className="text-xl font-semibold text-green-700 mb-4">{gridData.name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available Units:</span>
                      {editMode ? (
                        <input
                          type="number"
                          name="availableUnits"
                          value={form.availableUnits}
                          onChange={handleInputChange}
                          className="border rounded px-2 py-1 w-24 text-right"
                          min={0}
                        />
                      ) : (
                        <span className="font-bold text-green-800">{gridData.availableUnits}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Units for Sale:</span>
                      <span className="font-bold text-green-800">{gridData.unitsForSale}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Price / Unit:</span>
                      {editMode ? (
                        <input
                          type="number"
                          name="unitPrice"
                          value={form.unitPrice}
                          onChange={handleInputChange}
                          className="border rounded px-2 py-1 w-24 text-right"
                          min={0}
                          step={0.01}
                        />
                      ) : (
                        <span className="font-bold text-green-800">₹{gridData.unitPrice}</span>
                      )}
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
              {gridData ? (
                <UserGridMap position={gridData.location} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 bg-green-50 rounded-lg border border-dashed border-green-200">
                  <span>Map will appear here (Install <code>react-leaflet</code> and <code>leaflet</code> for full functionality)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

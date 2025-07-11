'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Powersharenavbar';
import api from '../lib/axios';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  Settings,
  LogOut,
  Coins,
  Edit3,
  Check,
  X
} from 'lucide-react';

import dynamic from 'next/dynamic';
const MapSection = dynamic(() => import('./mapSection'), { ssr: false });

// Simple geocoding using OpenStreetMap Nominatim API
async function geocodeLocation(query: string): Promise<{ lat: number; lng: number; address: string } | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        address: data[0].display_name
      };
    }
    return null;
  } catch {
    return null;
  }
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  tokens?: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface BackendUserData {
  _id: string;
  name: string;
  email: string;
  mobile: string;
}


const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedData, setEditedData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from backend on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        if (!token) {
          console.warn("No authentication token found, redirecting to login");
          router.push("/");
          return;
        }

        const response = await api.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const backendUserData = response.data as BackendUserData;
        
        // Get current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              const userDataWithLocation: UserData = {
                ...backendUserData,
                tokens: 1247.5, // TODO: Get from backend
                location: {
                  lat,
                  lng,
                  address: 'Current Location'
                }
              };
              setUserData(userDataWithLocation);
              setEditedData(userDataWithLocation);
              setIsLoading(false);
            },
            () => {
              // Fallback to Kochi if geolocation fails
              const userDataWithLocation: UserData = {
                ...backendUserData,
                tokens: 1247.5, // TODO: Get from backend
                location: {
                  lat: 9.9312,
                  lng: 76.2673,
                  address: 'Kochi, Kerala, India'
                }
              };
              setUserData(userDataWithLocation);
              setEditedData(userDataWithLocation);
              setIsLoading(false);
            }
          );
        } else {
          // No geolocation support
          const userDataWithLocation: UserData = {
            ...backendUserData,
            tokens: 1247.5, // TODO: Get from backend
            location: {
              lat: 9.9312,
              lng: 76.2673,
              address: 'Kochi, Kerala, India'
            }
          };
          setUserData(userDataWithLocation);
          setEditedData(userDataWithLocation);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(err.response?.data?.detail || "Failed to fetch user data");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);




  const handleSaveLocation = async () => {
    if (editedData && editedData.location) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          router.push("/");
          return;
        }

        // TODO: Backend API call to update user location
        // await api.put("/user/location", {
        //   latitude: editedData.location.lat,
        //   longitude: editedData.location.lng
        // }, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });

        setUserData(prev => prev ? ({
          ...prev,
          location: editedData.location
        }) : null);
        setIsEditingLocation(false);
      } catch (err: any) {
        console.error("Error updating location:", err);
        setError(err.response?.data?.detail || "Failed to update location");
      }
    }
  };

  const handleSaveProfile = async () => {
    if (editedData) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          router.push("/");
          return;
        }

        // TODO: Backend API call to update user profile
        // await api.put("/user/profile", {
        //   name: editedData.name,
        //   mobile: editedData.mobile
        // }, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });

        setUserData(editedData);
        setIsEditingProfile(false);
      } catch (err: any) {
        console.error("Error updating profile:", err);
        setError(err.response?.data?.detail || "Failed to update profile");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditedData(userData);
    setIsEditingProfile(false);
    setIsEditingLocation(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user");
    router.push("/");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userData || !editedData) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Coins className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <button className="text-lg font-medium text-green-700">View Wallet</button>
                   
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={editedData.name}
                      onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      value={editedData.email}
                      onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={editedData.mobile}
                      onChange={(e) => setEditedData({...editedData, mobile: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.mobile}</p>
                  )}
                </div>
              </div>
              {isEditingProfile && (
                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Location</h2>
                <button
                  onClick={() => setIsEditingLocation(!isEditingLocation)}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{isEditingLocation ? 'Cancel' : 'Edit Location'}</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Search bar for location */}
              {isEditingLocation && (
                <div className="mb-4">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const result = await geocodeLocation(editedData.location.address);
                      if (result) {
                        setEditedData(prev => prev ? {
                          ...prev,
                          location: {
                            ...prev.location,
                            lat: result.lat,
                            lng: result.lng,
                            address: result.address
                          }
                        } : prev);
                      }
                    }}
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search for a location..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-2"
                        value={editedData.location.address}
                        onChange={e => setEditedData(prev => prev ? {
                          ...prev,
                          location: {
                            ...prev.location,
                            address: e.target.value
                          }
                        } : prev)}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg"
                      >
                        Search
                      </button>
                    </div>
                  </form>
                  <p className="text-xs text-gray-500">Lat: {editedData.location.lat}, Lng: {editedData.location.lng}</p>
                </div>
              )}
              {!isEditingLocation && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Address</p>
                  <p className="text-gray-900">{userData.location.address}</p>
                  <p className="text-xs text-gray-500">Lat: {userData.location.lat}, Lng: {userData.location.lng}</p>
                </div>
              )}
              <MapSection
                userData={userData}
                editedData={editedData}
                setEditedData={setEditedData}
                isEditingLocation={isEditingLocation}
                className="h-64 rounded-lg overflow-hidden border border-gray-200"
              />
              {isEditingLocation && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Click on the map or drag the marker to set your location
                  </p>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSaveLocation}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Location</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

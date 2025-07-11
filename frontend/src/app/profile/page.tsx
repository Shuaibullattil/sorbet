'use client';

import React, { useState, useRef } from 'react';
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

interface UserData {
  name: string;
  email: string;
  phone: string;
  tokens: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}


const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    tokens: 1247.5,
    location: {
      lat: 40.7128,
      lng: -74.006,
      address: 'New York, NY, USA'
    }
  });


  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedData, setEditedData] = useState(userData);


  const handleSaveLocation = () => {
    setUserData(prev => ({
      ...prev,
      location: editedData.location
    }));
    setIsEditingLocation(false);
  };

  const handleSaveProfile = () => {
    setUserData(editedData);
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setEditedData(userData);
    setIsEditingProfile(false);
    setIsEditingLocation(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">

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
                    <p className="text-sm font-medium text-green-700">Available Tokens</p>
                    <p className="text-2xl font-bold text-green-600">{userData.tokens.toLocaleString()}</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={editedData.phone}
                      onChange={(e) => setEditedData({...editedData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.phone}</p>
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
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Address</p>
                <p className="text-gray-900">{userData.location.address}</p>
              </div>
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

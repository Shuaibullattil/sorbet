"use client"

import React, { useEffect, useState } from 'react';
import { Bell, Zap, CheckCircle, Clock, AlertCircle, TrendingUp, Coins, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Powersharenavbar';

// Notification types
type NotificationType = 'request' | 'confirmation' | 'transfer';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  energyAmount?: number;
  tokens?: number;
  buyerName?: string;
  sellerName?: string;
  requestId?: string;
}

// Mock notification data - replace with backend integration
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'request',
    title: 'New Energy Sale Request',
    message: 'Alice Johnson has requested to purchase 15.5 kWh of energy from you',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: false,
    energyAmount: 15.5,
    tokens: 155,
    buyerName: 'Alice Johnson',
    requestId: 'REQ-001'
  },
  {
    id: 2,
    type: 'confirmation',
    title: 'Sale Request Confirmed',
    message: 'Bob Smith has confirmed your request to purchase 8.2 kWh of energy',
    timestamp: '2024-01-14T14:20:00Z',
    isRead: false,
    energyAmount: 8.2,
    tokens: 82,
    sellerName: 'Bob Smith',
    requestId: 'REQ-002'
  },
  {
    id: 3,
    type: 'transfer',
    title: 'Energy Transfer Complete',
    message: 'Energy transfer of 22.1 kWh has been completed successfully',
    timestamp: '2024-01-13T09:15:00Z',
    isRead: true,
    energyAmount: 22.1,
    tokens: 221,
    buyerName: 'Carol Davis',
    sellerName: 'David Wilson',
    requestId: 'REQ-003'
  },
  {
    id: 4,
    type: 'request',
    title: 'New Energy Sale Request',
    message: 'Eva Brown has requested to purchase 12.8 kWh of energy from you',
    timestamp: '2024-01-12T16:45:00Z',
    isRead: true,
    energyAmount: 12.8,
    tokens: 128,
    buyerName: 'Eva Brown',
    requestId: 'REQ-004'
  },
  {
    id: 5,
    type: 'confirmation',
    title: 'Sale Request Confirmed',
    message: 'Frank Miller has confirmed your request to purchase 18.9 kWh of energy',
    timestamp: '2024-01-11T11:30:00Z',
    isRead: true,
    energyAmount: 18.9,
    tokens: 189,
    sellerName: 'Frank Miller',
    requestId: 'REQ-005'
  }
];

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Check authentication on component mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (!token) {
      console.warn("No authentication token found, redirecting to login");
      router.push("/");
      return;
    }
    
    setIsLoading(false);
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'request':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'confirmation':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'transfer':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'request':
        return 'bg-blue-50 border-blue-200';
      case 'confirmation':
        return 'bg-green-50 border-green-200';
      case 'transfer':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getNotificationBadge = (type: NotificationType) => {
    switch (type) {
      case 'request':
        return 'bg-blue-100 text-blue-700';
      case 'confirmation':
        return 'bg-green-100 text-green-700';
      case 'transfer':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    // TODO: Backend API call to mark notification as read
    // await api.put(`/notifications/${notificationId}/read`);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    // TODO: Backend API call to mark all notifications as read
    // await api.put('/notifications/mark-all-read');
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navbar />

      {/* Main Content */}
      <div className="lg:ml-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Notifications</h2>
          <p className="text-gray-600">Stay updated with your energy trading activities and requests</p>
        </div>

        {/* Stats and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg shadow-sm border border-green-200 px-4 py-2">
              <span className="text-sm font-medium text-gray-600">Total: </span>
              <span className="text-lg font-bold text-gray-900">{notifications.length}</span>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-green-200 px-4 py-2">
              <span className="text-sm font-medium text-gray-600">Unread: </span>
              <span className="text-lg font-bold text-red-600">{unreadCount}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Filter Buttons */}
            <div className="flex bg-white rounded-lg shadow-sm border border-green-200 p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'unread' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'read' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Read
              </button>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up! Check back later for new updates.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                  notification.isRead 
                    ? 'border-gray-200 opacity-75' 
                    : 'border-green-300 shadow-md'
                } ${getNotificationColor(notification.type)}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationBadge(notification.type)}`}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{notification.message}</p>
                        
                        {/* Additional Details */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          {notification.energyAmount && (
                            <div className="flex items-center space-x-1">
                              <Zap className="w-4 h-4 text-blue-500" />
                              <span>{notification.energyAmount} kWh</span>
                            </div>
                          )}
                          {notification.tokens && (
                            <div className="flex items-center space-x-1">
                              <Coins className="w-4 h-4 text-yellow-500" />
                              <span>{notification.tokens} tokens</span>
                            </div>
                          )}
                          {notification.buyerName && (
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4 text-green-500" />
                              <span>Buyer: {notification.buyerName}</span>
                            </div>
                          )}
                          {notification.sellerName && (
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4 text-purple-500" />
                              <span>Seller: {notification.sellerName}</span>
                            </div>
                          )}
                          {notification.requestId && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              ID: {notification.requestId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(notification.timestamp)}
                      </span>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Backend Integration Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Backend Integration Ready</h3>
              <p className="text-sm text-blue-700 mt-1">
                This page is designed to integrate with your backend API. Replace the mock data with real API calls to fetch notifications from your database. Implement real-time updates using WebSocket connections for live notifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 
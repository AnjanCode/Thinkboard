'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  LogOut,
  Users,
  Search,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import MedicinesManager from './MedicinesManager';

interface DashboardStats {
  totalMedicines: number;
  lowStockMedicines: number;
  todaysSales: { totalSales: number; totalBills: number };
  monthlySales: { totalSales: number; totalBills: number };
}

interface RecentBill {
  _id: string;
  billNumber: string;
  patientName: string;
  total: number;
  status: string;
  createdAt: string;
  createdBy: { name: string };
}

interface TopSellingMedicine {
  _id: string;
  medicineName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBills, setRecentBills] = useState<RecentBill[]>([]);
  const [topSellingMedicines, setTopSellingMedicines] = useState<TopSellingMedicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.overview);
        setRecentBills(data.recentBills);
        setTopSellingMedicines(data.topSellingMedicines);
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Medical Billing System
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'medicines', label: 'Medicines', icon: Package },
              { id: 'billing', label: 'Billing', icon: ShoppingCart },
              { id: 'inventory', label: 'Inventory', icon: AlertTriangle },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Medicines</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.totalMedicines || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Low Stock Items</p>
                    <p className="text-2xl font-semibold text-red-600">
                      {stats?.lowStockMedicines || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Today's Sales</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${stats?.todaysSales.totalSales.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <ShoppingCart className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Monthly Sales</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${stats?.monthlySales.totalSales.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bills and Top Selling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Bills</h3>
                </div>
                <div className="p-6">
                  {recentBills.length > 0 ? (
                    <div className="space-y-4">
                      {recentBills.map((bill) => (
                        <div key={bill._id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{bill.billNumber}</p>
                            <p className="text-sm text-gray-600">{bill.patientName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${bill.total.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">{bill.createdBy.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No recent bills</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Top Selling Medicines</h3>
                </div>
                <div className="p-6">
                  {topSellingMedicines.length > 0 ? (
                    <div className="space-y-4">
                      {topSellingMedicines.map((medicine) => (
                        <div key={medicine._id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{medicine.medicineName}</p>
                            <p className="text-sm text-gray-600">Qty: {medicine.totalQuantity}</p>
                          </div>
                          <p className="font-medium text-gray-900">
                            ${medicine.totalRevenue.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No sales data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'dashboard' && (
          <div>
            {activeTab === 'medicines' && <MedicinesManager />}
            {activeTab !== 'medicines' && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
                </h2>
                <p className="text-gray-600 mb-4">
                  This section is under development and will be available soon.
                </p>
                <p className="text-sm text-gray-500">
                  Features will include comprehensive {activeTab} management capabilities.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
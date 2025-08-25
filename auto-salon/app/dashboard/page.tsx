"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Car, ShoppingCart, Settings, MessageSquare } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/auth-context";

interface DashboardStats {
  totalUsers: number;
  totalVehicles: number;
  totalOrders: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVehicles: 0,
    totalOrders: 0,
  });
  const [unreadContacts, setUnreadContacts] = useState(0);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        return;
      }

      try {
        const [usersResponse, vehiclesResponse, contactsResponse, ordersResponse] = await Promise.all([
          axios.get("https://localhost:7234/api/Account/users", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get("https://localhost:7234/api/Vehicles", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get("https://localhost:7234/api/Contact/unread", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get("https://localhost:7234/api/Order", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
        setStats({
          totalUsers: usersResponse.data.length,
          totalVehicles: vehiclesResponse.data.length,
          totalOrders: ordersResponse.data.length,
        });
        setUnreadContacts(contactsResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="container mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Car className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Vehicles</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalVehicles}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadContacts}</div>
              <p className="text-xs text-muted-foreground">
                New contact messages
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900 dark:text-white">New user registration</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <Car className="w-5 h-5 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900 dark:text-white">New vehicle added</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900 dark:text-white">New order placed</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <Link href="/dashboard/users" className="w-full flex items-center space-x-3 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                <span className="text-gray-900 dark:text-white font-medium">Manage Users</span>
              </Link>
              <Link href="/dashboard/vehicles" className="w-full flex items-center space-x-3 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <Car className="w-5 h-5 text-green-600 dark:text-green-300" />
                <span className="text-gray-900 dark:text-white font-medium">Manage Vehicles</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 
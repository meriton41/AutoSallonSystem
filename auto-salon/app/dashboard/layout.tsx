"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { MessageSquare, ShoppingCart, Car } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.role !== "Admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-black-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-black text-white min-h-screen p-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Dashboard</h2>
          </div>
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/dashboard/users"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors"
            >
              User Management
            </Link>
            <Link
              href="/dashboard/vehicles"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors"
            >
              Vehicle Management
            </Link>
            
            <Link
              href="/dashboard/bills"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors"
            >
              Create Bill
            </Link>
            <Link
              href="/dashboard/bills/list"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors"
            >
              View Bills
            </Link>
            <Link
              href="/dashboard/car-insurance"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors"
            >
              Car Insurance
            </Link>
            <Link
              href="/dashboard/car-insurance/list"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors"
            >
              View Insurances
            </Link>
            <Link
              href="/dashboard/orders"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/dashboard/sold-cars"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Car className="h-4 w-4" />
              Sold Cars
            </Link>
            <Link
              href="/dashboard/test-drive-management"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Car className="h-4 w-4" />
              Test Drive
            </Link>
            <Link
              href="/dashboard/leazingcalculator"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors"
            >
              Leazing Calculator
            </Link>
            <Link
              href="/dashboard/contacts"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors"
            >
              Contacts
            </Link>
             <Link
              href="/dashboard/rating"
              className="block py-2 px-4 rounded hover:bg-gray-800 transition-colors"
            >
              Rating
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 
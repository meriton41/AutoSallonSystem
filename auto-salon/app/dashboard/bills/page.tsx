"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import BillForm from "./components/BillForm";
import { toast } from "react-hot-toast";

export default function BillsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!isAdmin) {
      router.push("/");
      toast.error("You don't have permission to access this page.");
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleBillCreated = (bill: any) => {
    toast.success("Bill created successfully!");
    // Optionally redirect to bills list or clear form
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-8">
      <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold mb-8 text-blue-600 dark:text-blue-500 text-left">Add New Bill</h1>
        <BillForm onBillCreated={handleBillCreated} />
      </div>
    </div>
  );
}

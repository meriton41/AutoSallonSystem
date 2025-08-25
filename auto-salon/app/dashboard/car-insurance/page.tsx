"use client";
import { CarInsurance } from "@/types/insurance";
import CarInsuranceForm from "@/components/CarInsuranceForm";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function DashboardCarInsurancePage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!isAdmin) {
      router.push("/");
      toast.error("You don't have permission to access this page. Admin role required.");
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const handleSubmit = (insurance: CarInsurance) => {
    alert(`Insurance saved for policy: ${insurance.policyNumber}`);
    // TODO: Add backend integration here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-8">
      <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold mb-8 text-blue-600 dark:text-blue-500 text-left">Add New Insurance</h1>
        <CarInsuranceForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

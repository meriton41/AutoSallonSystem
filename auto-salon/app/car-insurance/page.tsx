"use client";
import { CarInsurance } from "@/types/insurance";
import CarInsuranceForm from "@/components/CarInsuranceForm";

export default function CarInsurancePage() {
  // You can handle the onSubmit logic here if you want to save to your backend
  const handleSubmit = (insurance: CarInsurance) => {
    alert(`Insurance saved for policy: ${insurance.policyNumber}`);
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Dashboard: Add Car Insurance</h1>
      <div className="max-w-xl mx-auto bg-black p-8 rounded-lg shadow-md border border-gray-800">
        <CarInsuranceForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

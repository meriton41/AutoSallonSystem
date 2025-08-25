"use client";
import React, { useState, useEffect } from "react";
import { Bill } from "../types/bill";
import { Car } from "../types/car";
import { toast, ToastContainer } from "react-toastify";

const initialState: Bill = {
  id: "",
  clientName: "",
  clientEmail: "",
  vehicleId: 0,
  amount: 0,
  description: "",
  date: "",
};

export default function BillForm() {
  const [form, setForm] = useState<Bill>(initialState);
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    // Fetch all cars
    const fetchCars = async () => {
      try {
        const res = await fetch("https://localhost:7234/api/Vehicles");
        const data = await res.json();
        console.log("Fetched cars:", data);
        setCars(data);
      } catch {
        setCars([]);
      }
    };
    fetchCars();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        vehicleId: Number(form.vehicleId),
        amount: Number(form.amount),
        description: form.description,
        date: form.date ? new Date(form.date).toISOString() : null
      };
      const response = await fetch("https://localhost:7234/api/Bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        toast.success("Bill saved successfully!");
        setForm(initialState);
      } else if (response.status === 409) {
        const message = await response.text();
        toast.error(message);
      } else {
        toast.error("Failed to save bill.");
      }
    } catch {
      toast.error("Failed to save bill.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Client Name</label>
          <input name="clientName" value={form.clientName} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-gray-900 text-white" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Client Email</label>
          <input name="clientEmail" value={form.clientEmail} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-gray-900 text-white" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Car</label>
          <select name="vehicleId" value={form.vehicleId} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-gray-900 text-white" required>
            <option value="">Select a car</option>
            {cars.map(car => (
              <option key={car.id} value={car.id}>
                {car.title ? `${car.title} (${car.id})` : car.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Amount</label>
          <input name="amount" type="number" value={form.amount} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-gray-900 text-white" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-gray-900 text-white" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-gray-900 text-white" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Save Bill
        </button>
      </form>
      <ToastContainer />
    </>
  );
}

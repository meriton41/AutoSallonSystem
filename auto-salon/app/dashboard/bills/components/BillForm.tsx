"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { generateBillPdf } from '@/lib/generateBillPdf';

interface Vehicle {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
}

interface Bill {
  id: string;
  clientName: string;
  clientEmail: string;
  vehicleId: number;
  amount: number;
  discount: number;
  description: string;
  date: string;
}

interface BillFormProps {
  onBillCreated: (bill: any) => void;
}

export default function BillForm({ onBillCreated }: BillFormProps) {
  const { token, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    vehicleId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch("https://localhost:7234/api/Vehicles", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vehicles');
        }

        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setError('Failed to load vehicles');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBills = async () => {
      try {
        const response = await fetch("https://localhost:7234/api/Bill", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch bills');
        const data = await response.json();
        setBills(data);
      } catch (error) {
        // ignore for now
      }
    };

    if (token) {
      fetchVehicles();
      fetchBills();
    }
  }, [token]);

  useEffect(() => {
    // Debug auth state
    console.log('Auth state:', { isAuthenticated, isAdmin, hasToken: !!token });
  }, [isAuthenticated, isAdmin, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'vehicleId') {
      const selectedVehicle = vehicles.find(v => v.id.toString() === value);
      const baseAmount = selectedVehicle ? selectedVehicle.price : 0;
      setForm(prev => ({
        ...prev,
        [name]: value,
        amount: baseAmount.toString(),
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!isAuthenticated || !isAdmin) {
      setError("You must be logged in as an admin to create bills.");
      setIsSubmitting(false);
      return;
    }

    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setIsSubmitting(false);
      router.push('/login');
      return;
    }

    try {
      const response = await fetch("https://localhost:7234/api/Bill", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          vehicleId: Number(form.vehicleId),
          amount: Number(form.amount),
          description: form.description,
          date: form.date
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = "Failed to create bill";
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (e) {}
        setError(errorMessage);
        return;
      }

      const newBill = await response.json();
      onBillCreated(newBill);

      setForm({
        clientName: "",
        clientEmail: "",
        vehicleId: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0]
      });
      toast.success("Bill created successfully!");
    } catch (error) {
      setError("Failed to create bill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build a set of vehicleIds that already have a bill
  const billedVehicleIds = new Set(bills.map(b => b.vehicleId));

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">You must be logged in as an admin to create bills.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Client Name</label>
        <input
          type="text"
          name="clientName"
          value={form.clientName}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="w-full rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Client Email</label>
        <input
          type="email"
          name="clientEmail"
          value={form.clientEmail}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="w-full rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Car</label>
        <select
          name="vehicleId"
          value={form.vehicleId}
          onChange={handleChange}
          required
          disabled={isSubmitting || isLoading}
          className="w-full rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
        >
          <option value="">Select a car</option>
          {vehicles.map((vehicle) => (
            <option
              key={vehicle.id}
              value={vehicle.id}
              disabled={billedVehicleIds.has(vehicle.id)}
            >
              {vehicle.title} {billedVehicleIds.has(vehicle.id) ? '(Already billed)' : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Base Amount</label>
        <input
          type="number"
          value={vehicles.find(v => v.id.toString() === form.vehicleId)?.price || 0}
          disabled={true}
          className="w-full rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Final Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
          disabled={isSubmitting}
          className="w-full rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          rows={3}
          className="w-full rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="w-full rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
        />
      </div>
      {error && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-md text-sm">{error}</div>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition text-base mt-2"
      >
        {isSubmitting ? 'Creating...' : 'Create Bill'}
      </button>
    </form>
  );
} 
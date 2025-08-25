"use client";
import React, { useState, useEffect } from "react";
import { CarInsurance } from "../types/insurance";
import { Car } from "../types/car";
import { sendInsuranceEmail } from "../lib/generateInsurancePdf";
import emailjs from "emailjs-com";
import { toast, ToastContainer } from "react-toastify";

interface Props {
  onSubmit: (insurance: CarInsurance) => void;
}

const initialState: CarInsurance = {
  id: "",
  policyNumber: "",
  carId: "",
  clientName: "",
  clientEmail: "",
  startDate: "",
  endDate: "",
  coverageDetails: "",
  price: 0,
};

export default function CarInsuranceForm({ onSubmit }: Props) {
  const [form, setForm] = useState<CarInsurance>(initialState);
  const [assignedCarIds, setAssignedCarIds] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    // Initialize EmailJS
    emailjs.init("TwUwWzu0RatBeHGx1");
    
    // Fetch all insurances to get assigned car IDs
    const fetchInsurances = async () => {
      try {
        const userDataString = localStorage.getItem("user");
        if (!userDataString) {
          throw new Error("Authentication token not found. Please log in again.");
        }
        const userData = JSON.parse(userDataString);
        const token = userData.token;
        
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        // Check if user has admin role
        if (userData.role !== "Admin") {
          toast.error("You don't have permission to access this page. Admin role required.");
          setAssignedCarIds([]);
          return;
        }

        const res = await fetch("https://localhost:7234/api/CarInsurance", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.status === 401 || res.status === 403) {
          toast.error("You don't have permission to access this page. Admin role required.");
          setAssignedCarIds([]);
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setAssignedCarIds(data.map((insurance: CarInsurance) => insurance.carId));
      } catch (error) {
        console.error("Error fetching insurances:", error);
        toast.error("Failed to fetch insurances. Please try again later.");
        setAssignedCarIds([]);
      }
    };
    fetchInsurances();
  }, []);

  useEffect(() => {
    // Fetch all cars
    const fetchCars = async () => {
      try {
        const userDataString = localStorage.getItem("user");
        if (!userDataString) {
          throw new Error("Authentication token not found. Please log in again.");
        }
        const userData = JSON.parse(userDataString);
        const token = userData.token;
        
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        // Check if user has admin role
        if (userData.role !== "Admin") {
          toast.error("You don't have permission to access this page. Admin role required.");
          setCars([]);
          return;
        }

        const res = await fetch("https://localhost:7234/api/Vehicles", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.status === 401 || res.status === 403) {
          toast.error("You don't have permission to access this page. Admin role required.");
          setCars([]);
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setCars(data);
      } catch (error) {
        console.error("Error fetching cars:", error);
        toast.error("Failed to fetch cars. Please try again later.");
        setCars([]);
      }
    };
    fetchCars();
  }, []);

  const availableCars = cars.filter(car => !assignedCarIds.includes(car.id));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    
    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }
    
    // Save to backend
    const insuranceData = {
      policyNumber: form.policyNumber,
      vehicleId: parseInt(form.carId),
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      coverageDetails: form.coverageDetails,
      price: Number(form.price)
    };

    console.log('Sending insurance data:', insuranceData);

    try {
      // Get authentication token
      const userDataString = localStorage.getItem("user");
      if (!userDataString) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      const userData = JSON.parse(userDataString);
      const token = userData.token;
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // First, save the insurance
      const response = await fetch("https://localhost:7234/api/CarInsurance", {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(insuranceData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        
        if (errorText.includes("already has an insurance assigned")) {
          toast.error("This vehicle already has an insurance policy. Please select a different vehicle.");
        } else {
          toast.error(errorText || "Failed to save insurance.");
        }
        return;
      }

      console.log('Insurance saved successfully, now sending email...');

      // Then send email via EmailJS
      try {
        // Initialize EmailJS if not already done
        emailjs.init("TwUwWzu0RatBeHGx1");
        
        const emailResult = await emailjs.send(
          "service_z54rxk4",
          "template_crhjari",
          {
            client_name: form.clientName,
            client_email: form.clientEmail,
            policy_number: form.policyNumber,
            car_id: form.carId,
            start_date: form.startDate,
            end_date: form.endDate,
            coverage_details: form.coverageDetails,
            price: form.price,
          }
        );
        
        console.log('Email sent successfully:', emailResult);
        toast.success("Insurance saved and email sent successfully!");
        setForm(initialState);
        
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        toast.warning("Insurance saved successfully, but failed to send email notification.");
        setForm(initialState);
      }
      
    } catch (error) {
      console.error('Error in handleSaveAndSend:', error);
      toast.error("Failed to save insurance. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={handleSaveAndSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Policy Number</label>
          <input name="policyNumber" value={form.policyNumber} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Car</label>
          <select
            name="carId"
            value={form.carId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
            required
          >
            <option value="">Select a car</option>
            {availableCars.map(car => (
              <option key={car.id} value={car.id}>
                {car.title ? `${car.title} (${car.id})` : car.id}
              </option>
            ))}
          </select>
          {availableCars.length === 0 && (
            <div className="text-xs text-red-400 mt-1">
              No available cars to insure. All cars already have insurance policies.
            </div>
          )}
          {assignedCarIds.length > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              <span>Already assigned Car IDs: {assignedCarIds.join(", ")}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Client Name</label>
          <input name="clientName" value={form.clientName} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Client Email</label>
          <input name="clientEmail" type="email" value={form.clientEmail} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700" required />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Start Date</label>
            <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700" required />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">End Date</label>
            <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Coverage Details</label>
          <textarea name="coverageDetails" value={form.coverageDetails} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Price</label>
          <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700" required />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Save & Send Insurance to Client
          </button>
        </div>
      </form>
      <ToastContainer />
    </>
  );
}

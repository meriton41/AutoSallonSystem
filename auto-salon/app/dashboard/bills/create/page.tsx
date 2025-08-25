import React, { useState } from "react";

const [formData, setFormData] = useState({
  clientName: "",
  clientEmail: "",
  vehicleId: "",
  amount: "",
  discount: "0",
  description: "",
  date: new Date().toISOString().split("T")[0],
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  try {
    const userDataString = localStorage.getItem("user");
    if (!userDataString) {
      setError("Authentication token not found. Please log in again.");
      return;
    }

    const userData = JSON.parse(userDataString);
    const token = userData.token;
    
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }

    // Create the bill object from the form data
    const bill = {
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      vehicleId: Number(formData.vehicleId),
      amount: Number(formData.amount),
      discount: Number(formData.discount),
      description: formData.description,
      date: formData.date
    };

    const response = await fetch("https://localhost:7234/api/Bills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bill),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create bill");
    }

    setSuccess("Bill created successfully!");
    setFormData({
      clientName: "",
      clientEmail: "",
      vehicleId: "",
      amount: "",
      discount: "0",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : "An error occurred");
  }
};

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
    <div className="w-full max-w-2xl mx-auto bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-blue-500 text-left">Create Bill</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-300 mb-1">
            Client Name
          </label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-300 mb-1">
            Client Email
          </label>
          <input
            type="email"
            id="clientEmail"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-300 mb-1">
            Vehicle
          </label>
          <select
            id="vehicleId"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a vehicle</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.brand} {car.model} ({car.year})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
            Base Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="discount" className="block text-sm font-medium text-gray-300 mb-1">
            Discount (%)
          </label>
          <input
            type="number"
            id="discount"
            name="discount"
            min="0"
            max="100"
            value={formData.discount}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {success && (
          <div className="text-green-500 text-sm">{success}</div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Bill
          </button>
        </div>
      </form>
    </div>
  </div>
); 
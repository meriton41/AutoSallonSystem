"use client";
import { Bill } from "@/types/bill";
import React, { useEffect, useState } from "react";
import { generateBillPdf } from "@/lib/generateBillPdf";    
import { toast } from "react-hot-toast";

export default function BillListPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Bill>>({});
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
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

        const response = await fetch("https://localhost:7234/api/Bill", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Authentication failed. Please log in again.");
          } else if (response.status === 403) {
            setError("You don't have permission to view bills. Admin access required.");
          } else {
            const errorText = await response.text();
            setError(errorText || "Failed to fetch bills");
          }
          return;
        }

        const data = await response.json();
        console.log("Raw API response:", JSON.stringify(data, null, 2));
        // Convert Guid to string for each bill
        const billsWithStringIds = data.map((bill: any) => {
          console.log("Processing bill:", JSON.stringify(bill, null, 2));
          // Handle both id and Id cases, and ensure we have a valid ID
          const id = bill.id || bill.Id;
          if (!id) {
            console.error("Bill missing ID property:", JSON.stringify(bill, null, 2));
            return null;
          }
          return {
            ...bill,
            id: id.toString(), // Convert Guid to string
          };
        }).filter((bill: Bill | null): bill is Bill => bill !== null); // Remove any bills that failed to process
        console.log("Processed bills:", JSON.stringify(billsWithStringIds, null, 2));
        setBills(billsWithStringIds);
      } catch (error) {
        console.error("Error fetching bills:", error);
        setError("Failed to fetch bills. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchCars = async () => {
      try {
        const response = await fetch("https://localhost:7234/api/Vehicles");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched cars:", data);
          setCars(data);
        } else {
          console.error("Failed to fetch cars:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
      }
    };

    fetchBills();
    fetchCars();
  }, []);

  const handleEdit = (bill: Bill) => {
    console.log('Edit button clicked for bill:', bill);
    setEditingBill(bill);
    // Format the date to yyyy-MM-dd format for the input
    const formattedDate = new Date(bill.date).toISOString().split('T')[0];
    console.log('Formatted date:', formattedDate);
    setEditForm({
      clientName: bill.clientName,
      clientEmail: bill.clientEmail,
      description: bill.description,
      date: formattedDate
    });
    console.log('Setting showModal to true');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;

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

      const response = await fetch(`https://localhost:7234/api/Bill/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          setError("You don't have permission to delete bills. Admin access required.");
        } else {
          const errorText = await response.text();
          setError(errorText || "Failed to delete bill");
        }
        return;
      }

      setBills(bills.filter(bill => bill.id !== id));
      toast.success("Bill deleted successfully!");
    } catch (error) {
      console.error("Error deleting bill:", error);
      setError("Failed to delete bill. Please try again.");
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Edit form change:', { name, value });
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill) return;
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
      // Only update allowed fields
      const updatedBill = {
        id: editingBill.id,
        clientName: editForm.clientName || editingBill.clientName,
        clientEmail: editForm.clientEmail || editingBill.clientEmail,
        vehicleId: editingBill.vehicleId,
        amount: editingBill.amount, // keep original
        description: editForm.description || editingBill.description,
        date: editForm.date || editingBill.date
      };
      console.log('Sending update with bill:', updatedBill);
      const response = await fetch(`https://localhost:7234/api/Bill/${editingBill.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedBill),
      });
      if (!response.ok) {
        let errorMessage = "Failed to update bill";
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (e) {}
        setError(errorMessage);
        return;
      }

      // Update the bills array with the new data
      setBills(prevBills => 
        prevBills.map(bill => 
          bill.id === editingBill.id 
            ? { ...bill, ...updatedBill }
            : bill
        )
      );
      
      setShowModal(false);
      setEditingBill(null);
      setEditForm({});
      toast.success("Bill updated successfully!");
    } catch (error) {
      console.error("Error updating bill:", error);
      setError("Failed to update bill. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold mb-8 text-blue-600 dark:text-blue-500 text-left">View Bills</h1>
        <div className="overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="min-w-full bg-white dark:bg-gray-900 rounded-2xl shadow divide-y divide-gray-200 dark:divide-gray-800">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-base font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Car</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {bills.length > 0 ? (
                  bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-100 dark:hover:bg-gray-800/70 transition rounded-xl">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{bill.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{bill.vehicleId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">${bill.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{new Date(bill.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={async () => {
                              // Fetch car details
                              const res = await fetch(`https://localhost:7234/api/Vehicles/${bill.vehicleId}`);
                              const car = await res.json();
                              const doc = generateBillPdf(bill, car);
                              doc.save(`Bill-${bill.id}.pdf`);
                            }}
                            className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg flex items-center justify-center transition"
                            title="Download"
                          >
                            {/* Download Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(bill)}
                            className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg flex items-center justify-center transition"
                            title="Edit"
                          >
                            {/* Pencil Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2H7v-2l6-6z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(bill.id)}
                            className="bg-red-600 hover:bg-red-700 p-3 rounded-lg flex items-center justify-center transition"
                            title="Delete"
                          >
                            {/* Trash Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 bg-gray-100 dark:bg-gray-800/60 rounded-xl">
                      {loading ? "Loading bills..." : error || "No bills found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Edit Modal */}
        {(() => {
          console.log('Modal render check:', { showModal, editingBill });
          return showModal && editingBill && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-white">Edit Bill</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-300 mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      name="clientName"
                      value={editForm.clientName}
                      onChange={handleEditChange}
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
                      value={editForm.clientEmail}
                      onChange={handleEditChange}
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
                      value={editForm.description}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
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
                      value={editForm.date}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingBill(null);
                        setEditForm({});
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

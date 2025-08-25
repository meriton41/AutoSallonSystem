"use client";
import { useEffect, useState } from "react";
import { CarInsurance } from "../../../../types/insurance";
import { generateInsurancePdf } from "../../../../lib/generateInsurancePdf";
import { Car } from "../../../../types/car";
import { toast, ToastContainer } from "react-toastify";
import { Edit3, Trash2, Download } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";

export default function InsuranceListPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();
  const [insurances, setInsurances] = useState<CarInsurance[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<CarInsurance | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [assignedCarIds, setAssignedCarIds] = useState<Set<number>>(new Set());

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
        setInsurances([]);
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
        setInsurances([]);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setInsurances(data);
      setAssignedCarIds(new Set(data.map((insurance: CarInsurance) => insurance.carId)));
    } catch (error) {
      console.error("Error fetching insurances:", error);
      toast.error("Failed to fetch insurances. Please try again later.");
      setInsurances([]);
      setAssignedCarIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsurances();
  }, []);

  useEffect(() => {
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

        const res = await fetch("https://localhost:7234/api/Vehicles", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        setCars(data);
      } catch (error) {
        console.error("Error fetching cars:", error);
        setCars([]);
      }
    };
    fetchCars();
  }, []);

  const handleDownloadPdf = async (insurance: CarInsurance) => {
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

      // Fetch the car details
      const carResponse = await fetch(`https://localhost:7234/api/Vehicles/${insurance.vehicleId || insurance.carId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!carResponse.ok) {
        throw new Error('Failed to fetch car details');
      }
      const carData = await carResponse.json();
      
      // Create a new insurance object with the car details
      const insuranceWithCar = {
        ...insurance,
        Vehicle: carData
      };
      
      const doc = generateInsurancePdf(insuranceWithCar);
      doc.save(`Insurance-${insurance.policyNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handleEdit = (insurance: CarInsurance) => {
    // Find the car ID - insurance might have either vehicleId or carId
    const carId = insurance.vehicleId?.toString() || insurance.carId || "";
    
    setEditingInsurance({
      ...insurance,
      startDate: insurance.startDate?.slice(0, 10) || "",
      endDate: insurance.endDate?.slice(0, 10) || "",
      carId: carId
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInsurance) {
      toast.error("No insurance selected for editing.");
      return;
    }

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

      // Format dates to match backend expectations
      const startDate = new Date(editingInsurance.startDate);
      const endDate = new Date(editingInsurance.endDate);

      const updateData = {
        id: editingInsurance.id,
        policyNumber: editingInsurance.policyNumber,
        vehicleId: editingInsurance.vehicleId,
        clientName: editingInsurance.clientName,
        clientEmail: editingInsurance.clientEmail,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        coverageDetails: editingInsurance.coverageDetails,
        price: Number(editingInsurance.price)
      };

      console.log("Sending update data:", updateData);

      const response = await fetch(
        `https://localhost:7234/api/CarInsurance/${editingInsurance.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        toast.error(errorText || "Failed to update insurance.");
        return;
      }

      toast.success("Insurance updated successfully!");
      setIsEditModalOpen(false);
      setEditingInsurance(null);
      fetchInsurances(); // Refresh the list
    } catch (error) {
      console.error("Error updating insurance:", error);
      toast.error("Failed to update insurance. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
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

      const response = await fetch(`https://localhost:7234/api/CarInsurance/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success("Insurance deleted successfully!");
        fetchInsurances(); // Refresh the list
      } else {
        toast.error("Failed to delete insurance");
      }
    } catch (error) {
      console.error("Error deleting insurance:", error);
      toast.error("Failed to delete insurance");
    }
    setDeleteConfirm(null);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingInsurance(prev => prev ? { ...prev, [name]: value } : null);
  };

  // Get assigned car IDs (excluding the one being edited)
  const availableCars = cars.filter(car => {
    const carIdNum = parseInt(car.id);
    const isAssigned = assignedCarIds.has(carIdNum);
    const isCurrentlyEditingCar = editingInsurance && car.id === editingInsurance.carId;
    
    // Include if not assigned, or if it's the car currently being edited
    return !isAssigned || isCurrentlyEditingCar;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold mb-8 text-blue-600 dark:text-blue-500 text-left">View Insurances</h1>
        {loading ? (
          <p className="text-gray-900">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="min-w-full bg-white dark:bg-gray-900 rounded-2xl shadow divide-y divide-gray-200 dark:divide-gray-800">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Policy #</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Car ID</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Start</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">End</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-base font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {insurances.length > 0 ? (
                    insurances.map((insurance) => (
                      <tr key={insurance.id} className="hover:bg-gray-100 dark:hover:bg-gray-800/70 transition rounded-xl">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{insurance.policyNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{insurance.clientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{insurance.vehicleId || insurance.carId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{insurance.startDate?.slice(0, 10)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{insurance.endDate?.slice(0, 10)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">€{insurance.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownloadPdf(insurance)}
                              className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded transition-colors"
                              title="Download PDF"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(insurance)}
                              className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded transition-colors"
                              title="Edit Insurance"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(insurance.id)}
                              className="bg-red-600 hover:bg-red-500 text-white p-2 rounded transition-colors"
                              title="Delete Insurance"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400 bg-gray-100 dark:bg-gray-800/60 rounded-xl">
                        No insurances found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editingInsurance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-white">Edit Insurance</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Policy Number</label>
                  <input
                    type="text"
                    value={editingInsurance.policyNumber}
                    onChange={(e) =>
                      setEditingInsurance({
                        ...editingInsurance,
                        policyNumber: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Client Name</label>
                  <input
                    type="text"
                    value={editingInsurance.clientName}
                    onChange={(e) =>
                      setEditingInsurance({
                        ...editingInsurance,
                        clientName: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Client Email</label>
                  <input
                    type="email"
                    value={editingInsurance.clientEmail}
                    onChange={(e) =>
                      setEditingInsurance({
                        ...editingInsurance,
                        clientEmail: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Start Date</label>
                  <input
                    type="date"
                    value={editingInsurance.startDate.split('T')[0]}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      date.setHours(0, 0, 0, 0);
                      setEditingInsurance({
                        ...editingInsurance,
                        startDate: date.toISOString(),
                      });
                    }}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">End Date</label>
                  <input
                    type="date"
                    value={editingInsurance.endDate.split('T')[0]}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      date.setHours(0, 0, 0, 0);
                      setEditingInsurance({
                        ...editingInsurance,
                        endDate: date.toISOString(),
                      });
                    }}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Coverage Details</label>
                  <textarea
                    value={editingInsurance.coverageDetails}
                    onChange={(e) =>
                      setEditingInsurance({
                        ...editingInsurance,
                        coverageDetails: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Price</label>
                  <input
                    type="number"
                    value={editingInsurance.price}
                    onChange={(e) =>
                      setEditingInsurance({
                        ...editingInsurance,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingInsurance(null);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-white">Confirm Delete</h2>
              <p className="text-white mb-6">Are you sure you want to delete this insurance policy?</p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer theme="dark" />
      </div>
    </div>
  );
}

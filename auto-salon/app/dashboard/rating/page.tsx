"use client";

import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface Rating {
  id: string;
  userId: string;
  value: number;
  comment: string;
  createdAt: string;
}

export default function RatingPage() {
  const { isAdmin, token } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ userId: "", value: 0, comment: "", createdAt: "" });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdmin) fetchRatings();
  }, [isAdmin]);

  const fetchRatings = async () => {
    try {
      const response = await fetch("https://localhost:7234/api/WebsiteRatings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      }
    } catch (err) {
      setError("Failed to fetch ratings");
    }
  };

  const handleEdit = (rating: Rating) => {
    setEditingId(rating.id);
    setEditForm({
      userId: rating.userId,
      value: rating.value || 0,
      comment: rating.comment || "",
      createdAt: rating.createdAt,
    });
    setShowModal(true);
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`https://localhost:7234/api/WebsiteRatings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        setEditingId(null);
        setShowModal(false);
        fetchRatings();
      } else if (response.status === 403) {
        setError("You are not authorized to edit this rating");
      } else {
        setError("Failed to update rating");
      }
    } catch (err) {
      setError("Failed to update rating");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this rating?")) {
      try {
        const response = await fetch(`https://localhost:7234/api/WebsiteRatings/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          fetchRatings();
        } else if (response.status === 403) {
          setError("You are not authorized to delete this rating");
        } else {
          setError("Failed to delete rating");
        }
      } catch (err) {
        setError("Failed to delete rating");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "value" ? Math.max(1, Math.min(5, parseInt(value) || 0)) : value,
    }));
  };

  if (!isAdmin) {
    return <div className="text-center py-10 text-xl">Access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Rating Management
        </h1>

        {error && (
          <div className="text-red-500 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/50 dark:border-red-800">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="h-[600px] overflow-y-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((rating) => (
                  <tr key={rating.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">{rating.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{rating.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rating.value >= 4 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                        rating.value >= 3 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                      }`}>
                        {rating.value} / 5
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">{rating.comment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {new Date(rating.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleEdit(rating)}
                          className="bg-black/90 hover:bg-black text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(rating.id)}
                          className="bg-black/90 hover:bg-black text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Edit Rating</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <FiX size={28} />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Value</label>
                  <input
                    type="number"
                    name="value"
                    min="1"
                    max="5"
                    value={editForm.value}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Comment</label>
                  <textarea
                    name="comment"
                    value={editForm.comment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingId!)}
                  className="px-5 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-black/90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

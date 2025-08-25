"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth-context';
import { FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface TestDrive {
  id: number;
  userId: string;
  vehicleId: number;
  description: string;
  date: string;
  status: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
  user: {
    email: string;
  };
}

export default function TestDriveTable() {
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ status: '', description: '' });
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchTestDrives();
  }, []);

  const fetchTestDrives = async () => {
    try {
      const response = await fetch('https://localhost:7234/api/TestDrive', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTestDrives(data);
      }
    } catch (error) {
      console.error('Error fetching test drives:', error);
    }
  };

  const handleEdit = (testDrive: TestDrive) => {
    setEditingId(testDrive.id);
    setEditForm({
      status: testDrive.status || '',
      description: testDrive.description || ''
    });
    setShowModal(true);
  };

  const handleSave = async (id: number) => {
    try {
      const testDrive = testDrives.find(td => td.id === id);
      if (!testDrive) {
        throw new Error('Test drive not found');
      }
      console.log('Saving:', editForm);
      // Update both status and description in one request
      const response = await fetch(`https://localhost:7234/api/TestDrive/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: testDrive.vehicleId,
          description: editForm.description,
          date: testDrive.date,
          status: editForm.status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update test drive');
      }

      setEditingId(null);
      setShowModal(false);
      fetchTestDrives();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update test drive');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this test drive?')) {
      try {
        const response = await fetch(`https://localhost:7234/api/TestDrive/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchTestDrives();
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to delete test drive');
        }
      } catch (error) {
        setError('An error occurred while deleting the test drive');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'status') {
      console.log('Dropdown changed to:', value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Test Drive Management
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testDrives.map((testDrive) => (
                  <tr key={testDrive.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">{testDrive.user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {testDrive.vehicle.year} {testDrive.vehicle.make} {testDrive.vehicle.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {new Date(testDrive.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {testDrive.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        testDrive.status === 'Finished' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                        testDrive.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                      }`}>
                        {testDrive.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleEdit(testDrive)}
                          className="bg-black/90 hover:bg-black text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(testDrive.id)}
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
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Edit Test Drive</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <FiX size={28} />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">User</label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                    {testDrives.find(td => td.id === editingId)?.user.email}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Vehicle</label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                    {testDrives.find(td => td.id === editingId)?.vehicle.year} {testDrives.find(td => td.id === editingId)?.vehicle.make} {testDrives.find(td => td.id === editingId)?.vehicle.model}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Date</label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                    {testDrives.find(td => td.id === editingId) ? new Date(testDrives.find(td => td.id === editingId)!.date).toLocaleString() : ''}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select status</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
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
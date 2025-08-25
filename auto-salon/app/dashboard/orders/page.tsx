"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";

interface Order {
  id: number;
  userId: string;
  userName: string;
  vehicleId: number;
  vehicleName: string;
  vehicleImage: string;
  totalAmount: number;
  orderDate: string;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentDate?: string;
  shippingAddress?: string;
  shippingMethod?: string;
  estimatedDeliveryDate?: string;
  adminNotes?: string;
  userNotes?: string;
  adminActionDate?: string;
  adminActionBy?: string;
  isActive: boolean;
  cancellationDate?: string;
  cancellationReason?: string;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useAuth();
  const [updateForm, setUpdateForm] = useState({
    status: "",
    adminNotes: "",
    estimatedDeliveryDate: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://localhost:7234/api/Order", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleUpdateOrder = (order: Order) => {
    setSelectedOrder(order);
    setUpdateForm({
      status: order.status,
      adminNotes: order.adminNotes || "",
      estimatedDeliveryDate: order.estimatedDeliveryDate || "",
    });
    setIsUpdateModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await axios.put(`https://localhost:7234/api/Order/${selectedOrder.id}/status`, {
        status: updateForm.status,
        notes: updateForm.adminNotes,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      fetchOrders();
      setIsUpdateModalOpen(false);
      setError("");
    } catch (err) {
      setError("Failed to update order status");
      console.error(err);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = 
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Order Management
        </h1>

        {error && (
          <div className="text-red-500 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/50 dark:border-red-800">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by order ID, customer name, or vehicle"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.userName}</TableCell>
                      <TableCell>{order.vehicleName}</TableCell>
                      <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateOrder(order)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* View Order Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p>Name: {selectedOrder.userName}</p>
                  <p>Order Date: {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                  {selectedOrder.shippingAddress && (
                    <p>Shipping Address: {selectedOrder.shippingAddress}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Vehicle Information</h3>
                  <p>Name: {selectedOrder.vehicleName}</p>
                  <p>Total Amount: ${selectedOrder.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Order Status</h3>
                  <Badge className={getStatusBadgeColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                  {selectedOrder.paymentStatus && (
                    <p className="mt-2">Payment Status: {selectedOrder.paymentStatus}</p>
                  )}
                  {selectedOrder.paymentMethod && (
                    <p>Payment Method: {selectedOrder.paymentMethod}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Additional Information</h3>
                  {selectedOrder.adminNotes && (
                    <p>Admin Notes: {selectedOrder.adminNotes}</p>
                  )}
                  {selectedOrder.userNotes && (
                    <p>User Notes: {selectedOrder.userNotes}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Order Modal */}
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={updateForm.status}
                  onValueChange={(value) =>
                    setUpdateForm({ ...updateForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={updateForm.adminNotes}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, adminNotes: e.target.value })
                  }
                  placeholder="Add notes about this order"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Delivery Date</label>
                <Input
                  type="date"
                  value={updateForm.estimatedDeliveryDate}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      estimatedDeliveryDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate}>Update Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
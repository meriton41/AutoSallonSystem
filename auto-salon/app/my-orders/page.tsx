"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

interface Order {
  id: number;
  vehicleId: number;
  vehicleName: string;
  vehicleImage: string;
  totalAmount: number;
  orderDate: string;
  status: string;
  paymentStatus: string;
  shippingMethod: string;
  estimatedDeliveryDate: string | null;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !token) return;

      try {
        const response = await axios.get("https://localhost:7234/api/Order", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrders(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders");
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Please Login</h2>
            <p className="mb-4">You need to be logged in to view your orders.</p>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">No Orders Found</h2>
            <p className="mb-4">You haven't placed any orders yet.</p>
            <Link href="/vehicles">
              <Button>Browse Vehicles</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Vehicle Image */}
                  <div className="relative w-full md:w-48 h-48">
                    <Image
                      src={order.vehicleImage.split(',')[0] || '/placeholder.svg'}
                      alt={order.vehicleName}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  {/* Order Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{order.vehicleName}</h3>
                        <p className="text-gray-600">Order #{order.id}</p>
                      </div>
                      <Badge 
                        className={
                          order.status === 'Pending' ? 'bg-yellow-500' :
                          order.status === 'Completed' ? 'bg-green-500' :
                          order.status === 'Cancelled' ? 'bg-red-500' :
                          'bg-blue-500'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p>{new Date(order.orderDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-semibold">€{order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Status</p>
                        <p>{order.paymentStatus || 'Pending'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Shipping Method</p>
                        <p>{order.shippingMethod}</p>
                      </div>
                    </div>

                    {order.estimatedDeliveryDate && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p>{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-4">
                      <Link href={`/my-orders/${order.id}`}>
                        <Button>View Details</Button>
                      </Link>
                      <Link href={`/vehicles/${order.vehicleId}`}>
                        <Button variant="outline">View Vehicle</Button>
                      </Link>
                      {order.status === 'Pending' && (
                        <Button variant="destructive" onClick={() => {
                          // TODO: Implement cancel order functionality
                          toast.info("Cancel functionality coming soon");
                        }}>
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
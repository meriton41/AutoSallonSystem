"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react";

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
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string | null;
  shippingAddress: string;
  shippingMethod: string;
  estimatedDeliveryDate: string | null;
  adminNotes: string | null;
  userNotes: string | null;
  isActive: boolean;
  cancellationDate: string | null;
  cancellationReason: string | null;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!isAuthenticated || !token) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.get(
          `https://localhost:7234/api/Order/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrder(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to fetch order details");
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id, isAuthenticated, token, router]);

  const handleCancelOrder = async () => {
    if (!order || !token) return;

    try {
      await axios.put(
        `https://localhost:7234/api/Order/${order.id}/cancel`,
        {
          cancellationReason: "Cancelled by user",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh order data
      const response = await axios.get(
        `https://localhost:7234/api/Order/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrder(response.data);
      toast.success("Order cancelled successfully");
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast.error("Failed to cancel order");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p>{error || "Order not found"}</p>
            <Link href="/my-orders" className="mt-4 inline-block">
              <Button>Back to My Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <Link href="/my-orders">
          <Button variant="outline">Back to My Orders</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Information */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative w-full md:w-64 h-48">
                <Image
                  src={order.vehicleImage.split(",")[0] || "/placeholder.svg"}
                  alt={order.vehicleName}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold mb-2">{order.vehicleName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p>{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold">€{order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Status</h2>
            <div className="space-y-4">
              <Badge
                className={`text-lg px-4 py-2 ${
                  order.status === "Pending"
                    ? "bg-yellow-500"
                    : order.status === "Completed"
                    ? "bg-green-500"
                    : order.status === "Cancelled"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              >
                {order.status}
              </Badge>
              {order.status === "Pending" && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p>{order.paymentMethod || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p>{order.paymentStatus || "Pending"}</p>
                </div>
              </div>
              {order.paymentDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Payment Date</p>
                    <p>{new Date(order.paymentDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Shipping Address</p>
                  <p>{order.shippingAddress || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Shipping Method</p>
                  <p>{order.shippingMethod}</p>
                </div>
              </div>
              {order.estimatedDeliveryDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p>
                      {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {(order.userNotes || order.adminNotes) && (
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {order.userNotes && (
                  <div>
                    <h3 className="font-medium mb-2">Your Notes</h3>
                    <p className="text-gray-600">{order.userNotes}</p>
                  </div>
                )}
                {order.adminNotes && (
                  <div>
                    <h3 className="font-medium mb-2">Admin Notes</h3>
                    <p className="text-gray-600">{order.adminNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancellation Information */}
        {order.cancellationDate && (
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-500">
                Cancellation Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Cancellation Date</p>
                  <p>
                    {new Date(order.cancellationDate).toLocaleDateString()}
                  </p>
                </div>
                {order.cancellationReason && (
                  <div>
                    <p className="text-sm text-gray-600">Reason</p>
                    <p>{order.cancellationReason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, DollarSign, Car, Calendar } from "lucide-react";
import { generateSoldCarsReport } from "@/lib/generateSoldCarsReport";
import toast from "react-hot-toast";

interface SoldCar {
  id: number;
  title: string;
  brand: string;
  year: number;
  originalPrice: number;
  salePrice: number;
  saleDate: string;
  clientName: string;
  clientEmail: string;
  image: string;
}

interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  averageDiscount: number;
  totalCars: number;
  topBrand: string;
  topBrandSales: number;
  recentSales: number;
}

export default function SoldCarsPage() {
  const [soldCars, setSoldCars] = useState<SoldCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SalesSummary>({
    totalSales: 0,
    totalRevenue: 0,
    averageDiscount: 0,
    totalCars: 0,
    topBrand: "",
    topBrandSales: 0,
    recentSales: 0
  });

  useEffect(() => {
    const fetchSoldCars = async () => {
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

        // Fetch bills with vehicle details
        const response = await fetch("https://localhost:7234/api/Bill", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch sold cars data");
        }

        const bills = await response.json();
        
        // Transform the data to include vehicle details
        const soldCarsData = await Promise.all(
          bills.map(async (bill: any) => {
            const vehicleResponse = await fetch(`https://localhost:7234/api/Vehicles/${bill.vehicleId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (!vehicleResponse.ok) {
              throw new Error(`Failed to fetch vehicle details for ID ${bill.vehicleId}`);
            }

            const vehicle = await vehicleResponse.json();
            
            return {
              id: vehicle.id,
              title: vehicle.title,
              brand: vehicle.brand,
              year: vehicle.year,
              originalPrice: vehicle.price,
              salePrice: bill.amount,
              saleDate: bill.date,
              clientName: bill.clientName,
              clientEmail: bill.clientEmail,
              image: vehicle.image
            };
          })
        );

        setSoldCars(soldCarsData);
      } catch (error) {
        console.error("Error fetching sold cars:", error);
        setError(error instanceof Error ? error.message : "An error occurred while fetching sold cars");
      } finally {
        setLoading(false);
      }
    };

    fetchSoldCars();
  }, []);

  useEffect(() => {
    // Calculate summary statistics whenever soldCars changes
    if (!soldCars || soldCars.length === 0) {
      setSummary({
        totalSales: 0,
        totalRevenue: 0,
        averageDiscount: 0,
        totalCars: 0,
        topBrand: "",
        topBrandSales: 0,
        recentSales: 0
      });
      return;
    }
    const totalRevenue = soldCars.reduce((sum, car) => sum + car.salePrice, 0);
    const totalOriginalValue = soldCars.reduce((sum, car) => sum + car.originalPrice, 0);
    const averageDiscount = totalOriginalValue > 0 ? ((totalOriginalValue - totalRevenue) / totalOriginalValue) * 100 : 0;
    const brandCounts = soldCars.reduce((acc, car) => {
      acc[car.brand] = (acc[car.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topBrand = Object.entries(brandCounts).reduce((a, b) => a[1] > b[1] ? a : b, ["", 0])[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSales = soldCars.filter(car => new Date(car.saleDate) >= thirtyDaysAgo).length;
    setSummary({
      totalSales: soldCars.length,
      totalRevenue,
      averageDiscount,
      totalCars: soldCars.length,
      topBrand,
      topBrandSales: brandCounts[topBrand] || 0,
      recentSales
    });
  }, [soldCars]);

  const handleGenerateReport = async () => {
    const toastId = toast.loading("Generating report...");
    try {
      if (soldCars.length === 0) {
        setError("No sales data available to generate report");
        toast.error("No sales data available to generate report", { id: toastId });
        return;
      }
      await generateSoldCarsReport(soldCars, summary);
      toast.success("Report generated! Check your downloads folder.", { id: toastId });
    } catch (error) {
      console.error("Error generating report:", error);
      setError(error instanceof Error ? error.message : "Failed to generate report. Please try again.");
      toast.error("Failed to generate report. Please try again.", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Sold Cars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Sold Cars</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleGenerateReport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
              title="Generate PDF Report"
            >
              <Download className="h-5 w-5" />
              <span className="font-semibold">Download Sales Report</span>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Original Price</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Sale Date</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Client Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soldCars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>
                      <div className="relative w-20 h-12">
                        <Image
                          src={car.image && car.image.split(",")[0] !== "string" ? car.image.split(",")[0] : "/placeholder.svg"}
                          alt={car.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{car.title}</TableCell>
                    <TableCell>{car.brand}</TableCell>
                    <TableCell>{car.year}</TableCell>
                    <TableCell className="line-through text-gray-500">€{car.originalPrice.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold text-green-600">€{car.salePrice.toFixed(2)}</TableCell>
                    <TableCell>{new Date(car.saleDate).toLocaleDateString()}</TableCell>
                    <TableCell>{car.clientName}</TableCell>
                    <TableCell>{car.clientEmail}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Compact Revenue Summary */}
      <Card className="mt-4 max-w-md ml-auto">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Cars Sold:</span>
              <span className="font-medium">{summary.totalSales}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Revenue:</span>
              <span className="font-medium">€{summary.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Average Price:</span>
              <span className="font-medium">€{(summary.totalRevenue / summary.totalSales || 0).toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Generated:</span>
                <span className="text-blue-600">€{summary.totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
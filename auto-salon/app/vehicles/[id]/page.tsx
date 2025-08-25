"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Fuel, Gauge, Tag, Zap } from "lucide-react";
import VehicleGallery from "@/components/vehicle-gallery";
import RelatedVehicles from "@/components/related-vehicles";
import { useAuth } from "@/context/auth-context";
import { toast } from "react-toastify";

interface Vehicle {
  id: number;
  title: string;
  image: string;
  year: number;
  mileage: string;
  brand: string;
  brandLogo: string;
  isNew: boolean;
  engine: string;
  fuel: string;
  power: string;
  description: string;
  transmission: string;
  color: string;
  interiorColor: string;
  features: string;
  price: number;
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOrdered, setHasOrdered] = useState(false);
  const { token, isAuthenticated } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!vehicleId) return;

    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://localhost:7234/api/Vehicles/${vehicleId}`
        );
        setVehicle(response.data);
      } catch (err) {
        setError("Failed to fetch vehicle details");
        console.error("Error fetching vehicle details:", err);
      } finally {
        setLoading(false);
      }
    };

    const checkOrderStatus = async () => {
      if (!isAuthenticated || !token) return;
      
      try {
        const numericVehicleId = parseInt(vehicleId as string);
        if (isNaN(numericVehicleId)) return;

        const response = await axios.get(
          `https://localhost:7234/api/Order/check/${numericVehicleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setHasOrdered(response.data);
      } catch (err) {
        console.error("Error checking order status:", err);
      }
    };

    fetchVehicle();
    checkOrderStatus();
  }, [vehicleId, isAuthenticated, token]);

  const handleOrder = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to place an order");
      router.push("/login");
      return;
    }

    try {
      const numericVehicleId = parseInt(vehicleId as string);
      if (isNaN(numericVehicleId)) {
        toast.error("Invalid vehicle ID");
        return;
      }

      await axios.post(
        "https://localhost:7234/api/Order",
        {
          vehicleId: numericVehicleId,
          shippingAddress: "",
          shippingMethod: "Standard",
          userNotes: ""
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setHasOrdered(true);
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place order");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-64 w-full mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8 text-muted-foreground">
        Vehicle not found.
      </div>
    );
  }

  const images = vehicle.image.split(',').map(img => img.trim()).filter(img => img !== "string" && img !== "");
  const totalImages = images.length;
  const goToPrev = () => setCurrentImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  const goToNext = () => setCurrentImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 space-y-12">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/vehicles')}
            className="flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Vehicles
          </Button>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white text-center lg:text-left">{vehicle.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Image / Gallery */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Slider */}
            <div className="space-y-4">
              <div className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer" onClick={() => setIsModalOpen(true)}>
                {images.length > 0 ? (
                  <Image
                    src={images[currentImage]}
                    alt={vehicle.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src="/placeholder.svg"
                    alt="No image"
                    fill
                    className="object-cover"
                  />
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrev();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white rounded-full p-3 z-20"
                      aria-label="Previous image"
                    >
                      &#8592;
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white rounded-full p-3 z-20"
                      aria-label="Next image"
                    >
                      &#8594;
                    </button>
                  </>
                )}
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                    {currentImage + 1} / {totalImages}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 ${
                        currentImage === index
                          ? 'border-blue-500 dark:border-blue-400'
                          : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${vehicle.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lightbox Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                {/* Click outside to close */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsModalOpen(false)}
                />
                <div className="relative w-full max-w-3xl h-[80vh] flex items-center justify-center z-50">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white rounded-full p-2 z-20"
                    aria-label="Close modal"
                  >
                    &#10005;
                  </button>
                  {images.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrev();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white rounded-full p-3 z-20"
                      aria-label="Previous image"
                    >
                      &#8592;
                    </button>
                  )}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={images[currentImage]}
                      alt={vehicle.title}
                      fill
                      className="object-contain rounded-xl"
                    />
                  </div>
                  {images.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white rounded-full p-3 z-20"
                      aria-label="Next image"
                    >
                      &#8594;
                    </button>
                  )}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-4 py-2 rounded-full">
                    {currentImage + 1} / {totalImages}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            <Card className="p-8 shadow-xl bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <CardContent className="p-0 space-y-8">
                <div className="flex items-center justify-between border-b pb-4 border-gray-200 dark:border-gray-600">
                  <span className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">€{vehicle.price.toFixed(2)}</span>
                  {vehicle.isNew && (
                    <Badge variant="secondary" className="bg-green-500 text-white px-3 py-1 text-sm rounded-full">New</Badge>
                  )}
                </div>
                
                {/* Specifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-700 dark:text-gray-300">
                  <div className="flex items-center space-x-2"><span className="font-semibold text-gray-900 dark:text-white">Brand:</span> <span>{vehicle.brand}</span></div>
                  <div className="flex items-center space-x-2"><Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" /><span className="font-semibold text-gray-900 dark:text-white">Year:</span> <span>{vehicle.year}</span></div>
                  <div className="flex items-center space-x-2"><Gauge className="h-5 w-5 text-gray-500 dark:text-gray-400" /><span className="font-semibold text-gray-900 dark:text-white">Mileage:</span> <span>{vehicle.mileage}</span></div>
                  <div className="flex items-center space-x-2"><Fuel className="h-5 w-5 text-gray-500 dark:text-gray-400" /><span className="font-semibold text-gray-900 dark:text-white">Fuel:</span> <span>{vehicle.fuel}</span></div>
                  <div className="flex items-center space-x-2"><span className="font-semibold text-gray-900 dark:text-white">Transmission:</span> <span>{vehicle.transmission}</span></div>
                  <div className="flex items-center space-x-2"><span className="font-semibold text-gray-900 dark:text-white">Color:</span> <span>{vehicle.color}</span></div>
                  <div className="flex items-center space-x-2"><span className="font-semibold text-gray-900 dark:text-white">Interior Color:</span> <span>{vehicle.interiorColor}</span></div>
                  <div className="flex items-center space-x-2"><span className="font-semibold text-gray-900 dark:text-white">Engine:</span> <span>{vehicle.engine}</span></div>
                  <div className="flex items-center space-x-2"><Zap className="h-5 w-5 text-gray-500 dark:text-gray-400" /><span className="font-semibold text-gray-900 dark:text-white">Power:</span> <span>{vehicle.power}</span></div>
                </div>

                {/* Description */}
                <div className="space-y-2 border-t pt-6 border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{vehicle.description}</p>
                </div>

                {/* Features */}
                {vehicle.features && (
                  <div className="space-y-2 border-t pt-6 border-gray-200 dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Features</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{vehicle.features}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-600 space-y-4">
                  {!hasOrdered ? (
                    <Button 
                      onClick={handleOrder}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
                    >
                      Order Now
                    </Button>
                  ) : (
                    <Button 
                      disabled
                      className="w-full bg-gray-400 text-white text-lg font-semibold py-3 rounded-lg"
                    >
                      Already Ordered
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    className="w-full text-lg font-semibold py-3 rounded-lg"
                  >
                    Inquire About This Vehicle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

         {/* Related Vehicles (Optional) */}
        {/* <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Related Vehicles</h2>
           {/* Implement logic to fetch and display related vehicles */}
        {/* </div> */}
      </div>
    </div>
  );
}


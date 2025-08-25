"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Vehicle = {
  id: number
  title: string
  image: string
  year: number
  mileage: string
  brand: string
  brandLogo: string
  isNew: boolean
  engine: string
  fuel: string
  power: string
  price: number
  transmission: string
  color: string
}

type VehicleListProps = {
  vehicles: Vehicle[]
}

export default function VehicleList({ vehicles }: VehicleListProps) {
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true)
      try {
        if (user?.token) {
          const headers = { Authorization: `Bearer ${user.token}` }
          const favoritesResponse = await axios.get("https://localhost:7234/api/FavoriteVehicles", {
            headers,
          })
          setFavorites(favoritesResponse.data.map((f: any) => f.vehicleId))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [user?.token])

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleFavorite = async (vehicleId: number) => {
    if (!user?.token || !user?.userId) {
      // Redirect to login or show login prompt
      return;
    }

    const headers = { Authorization: `Bearer ${user.token}` };
    const userId = user.userId;

    try {
      if (favorites.includes(vehicleId)) {
        await axios.delete(`https://localhost:7234/api/FavoriteVehicles/${vehicleId}?userId=${userId}`, { headers });
        setFavorites(favorites.filter(id => id !== vehicleId));
      } else {
        await axios.post(`https://localhost:7234/api/FavoriteVehicles/${vehicleId}?userId=${userId}`, {}, { headers });
        setFavorites([...favorites, vehicleId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="w-full max-w-md mx-auto mb-8">
        <Input
          type="text"
          placeholder="Search vehicles by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No vehicles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
              <Card className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800">
                <div className="relative h-48">
                  <Image
                    src={vehicle.image && vehicle.image.split(",")[0] !== "string" ? vehicle.image.split(",")[0] : "/placeholder.svg"}
                    alt={vehicle.title}
                    fill
                    className="object-cover"
                  />
                  {vehicle.isNew && (
                    <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">New</Badge>
                  )}
                  {user && user.role === "User" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 left-2 bg-white/80 hover:bg-white dark:bg-gray-700/80 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      onClick={(e) => {
                        e.preventDefault()
                        toggleFavorite(vehicle.id)
                      }}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favorites.includes(vehicle.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </Button>
                  )}
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center mb-2">
                    {/* Brand Logo (Optional - you might want to place this differently) */}
                     {/* <Image
                      src={vehicle.brandLogo || "/placeholder.svg"}
                      alt={vehicle.brand}
                      width={40}
                      height={30}
                      className="mr-2"
                    /> */}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{vehicle.title}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center space-x-1"><span className="font-semibold text-gray-900 dark:text-white">Brand:</span> <span>{vehicle.brand}</span></div>
                    <div className="flex items-center space-x-1"><span className="font-semibold text-gray-900 dark:text-white">Year:</span> <span>{vehicle.year}</span></div>
                    <div className="flex items-center space-x-1"><span className="font-semibold text-gray-900 dark:text-white">Mileage:</span> <span>{vehicle.mileage}</span></div>
                    <div className="flex items-center space-x-1"><span className="font-semibold text-gray-900 dark:text-white">Fuel:</span> <span>{vehicle.fuel}</span></div>
                    <div className="flex items-center space-x-1"><span className="font-semibold text-gray-900 dark:text-white">Transmission:</span> <span>{vehicle.transmission}</span></div>
                    <div className="flex items-center space-x-1"><span className="font-semibold text-gray-900 dark:text-white">Color:</span> <span>{vehicle.color}</span></div>
                  </div>

                  {/* Price */}
                  <div className="mt-4 text-xl font-bold text-blue-600 dark:text-blue-400">€{vehicle.price.toFixed(2)}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


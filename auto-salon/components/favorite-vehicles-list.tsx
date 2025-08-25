"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import axios from "axios"

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
}

export default function FavoriteVehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchFavoriteVehicles = async () => {
      try {
        const headers = user?.token
          ? { Authorization: `Bearer ${user.token}` }
          : {};
        const userId = user?.userId;
        const url = userId
          ? `https://localhost:7234/api/FavoriteVehicles?userId=${userId}`
          : "https://localhost:7234/api/FavoriteVehicles";
        const response = await axios.get(url, { headers });
        console.log('Favorite vehicles API response:', response.data);
        // Extract the vehicle data from the response
        const favoriteVehicles = response.data.map((fav: any) => fav.vehicle);
        setVehicles(favoriteVehicles);
      } catch (error) {
        console.error("Error fetching favorite vehicles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavoriteVehicles()
  }, [user?.token, user?.userId])

  const removeFromFavorites = async (vehicleId: number) => {
    if (!user?.token || !user?.userId) {
      // Redirect to login or show login prompt
      return;
    }
    const headers = { Authorization: `Bearer ${user.token}` };
    const userId = user.userId;
    try {
      await axios.delete(`https://localhost:7234/api/FavoriteVehicles/${vehicleId}?userId=${userId}`, { headers });
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Favorite nuk ekziston më, thjesht hiqe nga UI
        setVehicles(vehicles.filter(v => v.id !== vehicleId));
      } else {
        console.error("Error removing from favorites:", error);
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-4">No favorite vehicles yet</h3>
        <p className="text-muted-foreground mb-6">
          Start adding vehicles to your favorites to see them here.
        </p>
        <Link href="/vehicles">
          <Button>Browse Vehicles</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
          <Card className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800">
            <div className="relative h-48">
              <Image
                src={vehicle.image && vehicle.image.split(",")[0] !== "string" ? vehicle.image.split(",")[0] : "/placeholder.svg"}
                alt={vehicle.title || `Vehicle ${vehicle.id}` || "Vehicle image"}
                fill
                className="object-cover"
              />
              {vehicle.isNew && (
                <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">New</Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 left-2 bg-white/80 hover:bg-white dark:bg-gray-700/80 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                onClick={(e) => {
                  e.preventDefault()
                  removeFromFavorites(vehicle.id)
                }}
              >
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{vehicle.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center space-x-1"><span className="font-semibold text-gray-900 dark:text-white">Brand:</span> <span>{vehicle.brand}</span></div>
                <div className="flex items-center space-x-1"><span className="font-semibold text-gray-900 dark:text-white">Year:</span> <span>{vehicle.year}</span></div>
                <div className="flex items-center space-x-1"><span className="font-semibold text-gray-900 dark:text-white">Engine:</span> <span>{vehicle.engine}</span></div>
                <div className="flex items-center space-x-1"><span className="font-semibold text-gray-900 dark:text-white">Fuel:</span> <span>{vehicle.fuel}</span></div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 
import type { Metadata } from "next"
import FavoriteVehiclesList from "@/components/favorite-vehicles-list"

export const metadata: Metadata = {
  title: "Favorite Vehicles | Auto Sherreti",
  description: "View your favorite vehicles at Auto Sherreti",
}

export default function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Favorite Vehicles</h1>
      <FavoriteVehiclesList />
    </div>
  )
} 
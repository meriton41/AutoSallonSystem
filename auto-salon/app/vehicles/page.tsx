"use client"

import type { Metadata } from "next"
import { useState, useEffect } from "react"
import VehicleList from "@/components/vehicle-list"
import VehicleFilters from "@/components/vehicle-filters"
import { useDebounce } from "@/hooks/use-debounce"
import axios from "axios"
import { useAuth } from "@/context/auth-context"

type Filters = {
  searchTerm: string
  brand: string
  minYear: number | ""
  maxYear: number | ""
  minPrice: number | ""
  maxPrice: number | ""
  fuel: string
  transmission: string
  color: string
  isNew: boolean | ""
}

const initialFilters: Filters = {
  searchTerm: "",
  brand: "",
  minYear: "",
  maxYear: "",
  minPrice: "",
  maxPrice: "",
  fuel: "",
  transmission: "",
  color: "",
  isNew: ""
}

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

export default function VehiclesPage() {
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300)

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth ? useAuth() : { user: null }
  const [searchTerm, setSearchTerm] = useState("")

  const buildQueryString = () => {
    const params = new URLSearchParams()
    if (filters.searchTerm) params.append("searchTerm", filters.searchTerm)
    if (filters.brand) params.append("brand", filters.brand)
    if (filters.minYear !== "") params.append("minYear", filters.minYear.toString())
    if (filters.maxYear !== "") params.append("maxYear", filters.maxYear.toString())
    if (filters.minPrice !== "") params.append("minPrice", filters.minPrice.toString())
    if (filters.maxPrice !== "") params.append("maxPrice", filters.maxPrice.toString())
    if (filters.fuel) params.append("fuel", filters.fuel)
    if (filters.transmission) params.append("transmission", filters.transmission)
    if (filters.color) params.append("color", filters.color)
    if (filters.isNew !== "") params.append("isNew", filters.isNew.toString())
    return params.toString()
  }

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true)
      try {
        const queryString = buildQueryString()
        const response = await axios.get(`https://localhost:7234/api/Vehicles?${queryString}`)
        setVehicles(response.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchVehicles()
  }, [filters])

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFilterChange = (key: keyof Filters, value: string | number | boolean | "") => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(initialFilters)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Our Vehicles</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <VehicleFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
          />
        </div>
        <div className="lg:col-span-3 space-y-8">
          <div className="w-full max-w-md mx-auto mb-8">
            <input
              type="text"
              placeholder="Search vehicles by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
          </div>
          <VehicleList vehicles={filteredVehicles} />
        </div>
      </div>
    </div>
  )
}


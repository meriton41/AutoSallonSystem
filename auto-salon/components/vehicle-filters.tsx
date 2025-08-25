"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import axios from "axios"

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

interface VehicleFiltersProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string | number | boolean | "") => void;
  onResetFilters: () => void;
}

export default function VehicleFilters({
  filters,
  onFilterChange,
  onResetFilters,
}: VehicleFiltersProps) {
  const [brands, setBrands] = useState<string[]>([])
  const [fuelTypes, setFuelTypes] = useState<string[]>([])
  const [transmissions, setTransmissions] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Assuming you have endpoints for other filter options
        const [brandsResponse, fuelResponse, transmissionResponse, colorResponse] = await Promise.all([
          axios.get("https://localhost:7234/api/Vehicles/brands"),
          // Replace with actual endpoints for fuel types, transmissions, and colors if they exist
          // Otherwise, you might need to create these endpoints or hardcode options for now
          // For demonstration, I'll assume similar endpoints or fallback to hardcoded if needed.
          // I'll add placeholder fetching logic for now.
          axios.get("https://localhost:7234/api/Vehicles/fueltypes").catch(() => ({ data: ["Petrol", "Diesel", "Electric", "Hybrid"] })),
          axios.get("https://localhost:7234/api/Vehicles/transmissions").catch(() => ({ data: ["Automatic", "Manual"] })),
          axios.get("https://localhost:7234/api/Vehicles/colors").catch(() => ({ data: ["Black", "White", "Silver", "Red", "Blue"] })),
        ]);
        
        setBrands(brandsResponse.data);
        setFuelTypes(fuelResponse.data);
        setTransmissions(transmissionResponse.data);
        setColors(colorResponse.data);

      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };
    fetchFilterOptions();
  }, []);

  const handleCheckboxChange = (isChecked: boolean) => {
    onFilterChange("isNew", isChecked);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
      <h3 className="text-xl font-bold mb-4">Filters</h3>

      <div className="space-y-4">
        {/* Brand Dropdown */}
        <div>
          <label className="text-sm font-medium">Brand</label>
          <Select value={filters.brand} onValueChange={(value) => onFilterChange("brand", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
                {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
              </div>

        {/* Year Range Inputs */}
        <div>
          <label className="text-sm font-medium">Year Range</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={filters.minYear}
              onChange={(e) => onFilterChange("minYear", parseInt(e.target.value) || "")}
              placeholder="Min Year"
            />
            <Input
              type="number"
              value={filters.maxYear}
              onChange={(e) => onFilterChange("maxYear", parseInt(e.target.value) || "")}
              placeholder="Max Year"
                />
              </div>
                </div>

        {/* Price Range Inputs */}
        <div>
          <label className="text-sm font-medium">Price Range</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onFilterChange("minPrice", parseInt(e.target.value) || "")}
              placeholder="Min Price"
            />
            <Input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange("maxPrice", parseInt(e.target.value) || "")}
              placeholder="Max Price"
                />
              </div>
        </div>

        {/* Fuel Type Dropdown */}
        <div>
          <label className="text-sm font-medium">Fuel Type</label>
          <Select value={filters.fuel} onValueChange={(value) => onFilterChange("fuel", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
                {fuelTypes.map((fuel) => (
                <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                ))}
            </SelectContent>
          </Select>
              </div>

        {/* Transmission Dropdown */}
        <div>
          <label className="text-sm font-medium">Transmission</label>
          <Select value={filters.transmission} onValueChange={(value) => onFilterChange("transmission", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
              {transmissions.map((transmission) => (
                 <SelectItem key={transmission} value={transmission}>{transmission}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color Dropdown */}
        <div>
          <label className="text-sm font-medium">Color</label>
          <Select value={filters.color} onValueChange={(value) => onFilterChange("color", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {colors.map((color) => (
                <SelectItem key={color} value={color}>{color}</SelectItem>
              ))}
                </SelectContent>
              </Select>
        </div>

        {/* New Vehicles Checkbox */}
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <Checkbox
              checked={filters.isNew === true}
              onCheckedChange={handleCheckboxChange}
            />
            New Vehicles
          </label>
        </div>

      </div>

      {/* Clear Filters Button */}
      <div className="flex flex-col gap-2">
        <Button variant="outline" onClick={onResetFilters}>Clear Filters</Button>
      </div>
    </div>
  )
}


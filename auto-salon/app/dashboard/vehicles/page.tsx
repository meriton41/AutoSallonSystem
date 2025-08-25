"use client";

import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

interface Vehicle {
  id?: number;
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

const initialForm: Vehicle = {
  id: undefined,
  title: "",
  image: "",
  year: 2020,
  mileage: "",
  brand: "",
  brandLogo: "",
  isNew: false,
  engine: "",
  fuel: "",
  power: "",
  description: "",
  transmission: "",
  color: "",
  interiorColor: "",
  features: "",
  price: 0,
};

export default function DashboardVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof initialForm>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchVehiclesAndOptions = async () => {
      setLoading(true);
      try {
        const [
          vehiclesResponse,
          brandsResponse,
          fuelResponse,
          transmissionResponse,
          colorResponse,
        ] = await Promise.all([
          axios.get("https://localhost:7234/api/Vehicles"),
          axios.get("https://localhost:7234/api/Vehicles/brands"),
          axios.get("https://localhost:7234/api/Vehicles/fueltypes"),
          axios.get("https://localhost:7234/api/Vehicles/transmissions"),
          axios.get("https://localhost:7234/api/Vehicles/colors"),
        ]);

        setVehicles(vehiclesResponse.data);
        setBrands(brandsResponse.data);
        setFuelTypes(fuelResponse.data);
        setTransmissions(transmissionResponse.data);
        setColors(colorResponse.data);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchVehiclesAndOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement;
    const type = target.type;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { id, ...formData } = form; // Exclude id for new vehicle creation
    try {
      await axios.post("https://localhost:7234/api/Vehicles", formData);
      setForm(initialForm);
      // Refresh list
      const response = await axios.get("https://localhost:7234/api/Vehicles");
      setVehicles(response.data);
    } catch (err) {
      setError("Failed to add vehicle");
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      id: vehicle.id,
      title: vehicle.title,
      image: vehicle.image,
      year: vehicle.year,
      mileage: vehicle.mileage,
      brand: vehicle.brand,
      brandLogo: vehicle.brandLogo,
      isNew: vehicle.isNew,
      engine: vehicle.engine,
      fuel: vehicle.fuel,
      power: vehicle.power,
      description: vehicle.description,
      transmission: vehicle.transmission,
      color: vehicle.color,
      interiorColor: vehicle.interiorColor,
      features: vehicle.features,
      price: vehicle.price,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingVehicle) return;
    setError(null);
    try {
      const updatedVehicleData = {
        id: editingVehicle.id,
        title: form.title,
        image: form.image,
        year: form.year,
        mileage: form.mileage,
        brand: form.brand,
        brandLogo: form.brandLogo,
        isNew: form.isNew,
        engine: form.engine,
        fuel: form.fuel,
        power: form.power,
        description: form.description,
        transmission: form.transmission,
        color: form.color,
        interiorColor: form.interiorColor,
        features: form.features,
        price: form.price,
      };
      console.log("Updating vehicle with ID:", editingVehicle.id);
      console.log("Data being sent for update:", updatedVehicleData);
      await axios.put(
        `https://localhost:7234/api/Vehicles/${editingVehicle.id}`,
        updatedVehicleData
      );
      setIsEditModalOpen(false);
      setEditingVehicle(null);
      setForm({
        id: undefined,
        title: "",
        image: "",
        year: 2020,
        mileage: "",
        brand: "",
        brandLogo: "",
        isNew: false,
        engine: "",
        fuel: "",
        power: "",
        description: "",
        transmission: "",
        color: "",
        interiorColor: "",
        features: "",
        price: 0,
      });
      // Refresh list
      const response = await axios.get("https://localhost:7234/api/Vehicles");
      setVehicles(response.data);
    } catch (err) {
      setError("Failed to update vehicle");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await axios.delete(`https://localhost:7234/api/Vehicles/${id}`);
      // Refresh list
      const response = await axios.get("https://localhost:7234/api/Vehicles");
      setVehicles(response.data);
    } catch (err) {
      setError("Failed to delete vehicle");
    }
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Vehicle Management
        </h1>

        {/* Add Vehicle Form */}
        <div className="mb-8 bg-white/50 backdrop-blur-sm p-6 rounded-lg border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Add New Vehicle</h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={form.title || ""}
                onChange={handleChange}
                placeholder="Title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL(s) - Comma Separated</Label>
              <Input
                id="image"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="Image URL(s)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={form.year ?? ""}
                onChange={handleChange}
                placeholder="Year"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                name="mileage"
                value={form.mileage}
                onChange={handleChange}
                placeholder="Mileage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Select
                value={form.brand}
                onValueChange={(value) => handleSelectChange("brand", value)}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandLogo">Brand Logo URL</Label>
              <Input
                id="brandLogo"
                name="brandLogo"
                value={form.brandLogo}
                onChange={handleChange}
                placeholder="Brand Logo URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="engine">Engine</Label>
              <Input
                id="engine"
                name="engine"
                value={form.engine}
                onChange={handleChange}
                placeholder="Engine"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel">Fuel</Label>
              <Select
                value={form.fuel}
                onValueChange={(value) => handleSelectChange("fuel", value)}
              >
                <SelectTrigger id="fuel">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((fuel) => (
                    <SelectItem key={fuel} value={fuel}>
                      {fuel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="power">Power</Label>
              <Input
                id="power"
                name="power"
                value={form.power}
                onChange={handleChange}
                placeholder="Power"
              />
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission</Label>
              <Select
                value={form.transmission}
                onValueChange={(value) =>
                  handleSelectChange("transmission", value)
                }
              >
                <SelectTrigger id="transmission">
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  {transmissions.map((transmission) => (
                    <SelectItem key={transmission} value={transmission}>
                      {transmission}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Select
                value={form.color}
                onValueChange={(value) => handleSelectChange("color", value)}
              >
                <SelectTrigger id="color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interiorColor">Interior Color</Label>
              <Input
                id="interiorColor"
                name="interiorColor"
                value={form.interiorColor}
                onChange={handleChange}
                placeholder="Interior Color"
              />
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label htmlFor="features">Features</Label>
              <Textarea
                id="features"
                name="features"
                value={form.features}
                onChange={handleChange}
                placeholder="Features"
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                id="isNew"
                name="isNew"
                type="checkbox"
                checked={form.isNew}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="isNew">New Vehicle</Label>
            </div>

            <button
              type="submit"
              className="lg:col-span-3 bg-black text-white rounded p-2 mt-2 hover:bg-gray-800 transition-colors"
            >
              Add Vehicle
            </button>
          </form>
        </div>

        {error && (
          <div className="text-red-500 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/50 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Vehicle List Display (Table) */}
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700 overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4">Existing Vehicles</h2>

          {/* Search Input */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search vehicles by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No vehicles found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-scroll">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-800 z-10">
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Fuel</TableHead>
                      <TableHead>Transmission</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <img
                            src={
                              vehicle.image &&
                              vehicle.image.split(",")[0] !== "string"
                                ? vehicle.image.split(",")[0]
                                : "/placeholder.svg"
                            }
                            alt={vehicle.title}
                            className="w-16 h-10 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {vehicle.title}
                        </TableCell>
                        <TableCell>{vehicle.brand}</TableCell>
                        <TableCell>{vehicle.year}</TableCell>
                        <TableCell>€{vehicle.price.toFixed(2)}</TableCell>
                        <TableCell>{vehicle.fuel}</TableCell>
                        <TableCell>{vehicle.transmission}</TableCell>
                        <TableCell>
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => handleEdit(vehicle)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(vehicle.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Edit Vehicle Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Edit Vehicle
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter vehicle title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">
                  Image URL(s) - Comma Separated
                </Label>
                <Input
                  id="edit-image"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="Enter image URL(s)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  id="edit-year"
                  name="year"
                  type="number"
                  value={form.year}
                  onChange={handleChange}
                  placeholder="Enter year"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mileage">Mileage</Label>
                <Input
                  id="edit-mileage"
                  name="mileage"
                  value={form.mileage}
                  onChange={handleChange}
                  placeholder="Enter mileage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-brand">Brand</Label>
                <Select
                  value={form.brand}
                  onValueChange={(value) => handleSelectChange("brand", value)}
                >
                  <SelectTrigger id="edit-brand">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-brandLogo">Brand Logo URL</Label>
                <Input
                  id="edit-brandLogo"
                  name="brandLogo"
                  value={form.brandLogo}
                  onChange={handleChange}
                  placeholder="Enter brand logo URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-engine">Engine</Label>
                <Input
                  id="edit-engine"
                  name="engine"
                  value={form.engine}
                  onChange={handleChange}
                  placeholder="Enter engine details"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fuel">Fuel</Label>
                <Select
                  value={form.fuel}
                  onValueChange={(value) => handleSelectChange("fuel", value)}
                >
                  <SelectTrigger id="edit-fuel">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map((fuel) => (
                      <SelectItem key={fuel} value={fuel}>
                        {fuel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-power">Power</Label>
                <Input
                  id="edit-power"
                  name="power"
                  value={form.power}
                  onChange={handleChange}
                  placeholder="Enter power"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter vehicle description"
                ></Textarea>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-transmission">Transmission</Label>
                <Select
                  value={form.transmission}
                  onValueChange={(value) =>
                    handleSelectChange("transmission", value)
                  }
                >
                  <SelectTrigger id="edit-transmission">
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissions.map((transmission) => (
                      <SelectItem key={transmission} value={transmission}>
                        {transmission}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Select
                  value={form.color}
                  onValueChange={(value) => handleSelectChange("color", value)}
                >
                  <SelectTrigger id="edit-color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-interiorColor">Interior Color</Label>
                <Input
                  id="edit-interiorColor"
                  name="interiorColor"
                  value={form.interiorColor}
                  onChange={handleChange}
                  placeholder="Enter interior color"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-features">Features</Label>
                <Textarea
                  id="edit-features"
                  name="features"
                  value={form.features}
                  onChange={handleChange}
                  placeholder="Enter vehicle features"
                ></Textarea>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  required
                />
              </div>
              <div className="flex items-center space-x-2 col-span-1 md:col-span-2">
                <input
                  id="edit-isNew"
                  name="isNew"
                  type="checkbox"
                  checked={form.isNew}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="edit-isNew">New Vehicle</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

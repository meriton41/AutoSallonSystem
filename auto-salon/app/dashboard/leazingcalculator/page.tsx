"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Car, CreditCard, DollarSign, Calendar, TrendingUp, Search, Filter, ArrowUpDown } from "lucide-react"
import { motion } from "framer-motion"

// Sample data for demonstration
const sampleVehicles = [
  {
    id: 1,
    name: "Mercedes S-Class",
    price: 85000,
    monthlyPayment: 1250,
    remainingPayments: 48,
    nextPayment: "2023-06-15",
    status: "Active",
  },
  {
    id: 2,
    name: "BMW X5",
    price: 65000,
    monthlyPayment: 980,
    remainingPayments: 36,
    nextPayment: "2023-06-10",
    status: "Active",
  },
  {
    id: 3,
    name: "Audi A8",
    price: 78000,
    monthlyPayment: 1150,
    remainingPayments: 42,
    nextPayment: "2023-06-20",
    status: "Active",
  },
  {
    id: 4,
    name: "Tesla Model S",
    price: 89000,
    monthlyPayment: 1320,
    remainingPayments: 48,
    nextPayment: "2023-06-05",
    status: "Overdue",
  },
  {
    id: 5,
    name: "Porsche Cayenne",
    price: 92000,
    monthlyPayment: 1450,
    remainingPayments: 48,
    nextPayment: "2023-06-25",
    status: "Active",
  },
  {
    id: 6,
    name: "Range Rover Sport",
    price: 76000,
    monthlyPayment: 1100,
    remainingPayments: 42,
    nextPayment: "2023-06-18",
    status: "Active",
  },
  {
    id: 7,
    name: "Lexus LS",
    price: 72000,
    monthlyPayment: 1050,
    remainingPayments: 36,
    nextPayment: "2023-06-12",
    status: "Active",
  },
  {
    id: 8,
    name: "Volvo XC90",
    price: 58000,
    monthlyPayment: 850,
    remainingPayments: 36,
    nextPayment: "2023-06-08",
    status: "Pending",
  },
]

export default function Home() {
  const [vehicles, setVehicles] = useState(sampleVehicles)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" })
  const [leasingParams, setLeasingParams] = useState({
    vehiclePrice: 50000,
    downPayment: 5000,
    term: 36,
    interestRate: 3.9,
  })

  // Calculate monthly payment based on leasing parameters
  const calculateMonthlyPayment = () => {
    const principal = leasingParams.vehiclePrice - leasingParams.downPayment
    const monthlyRate = leasingParams.interestRate / 100 / 12
    const months = leasingParams.term

    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    return monthlyPayment.toFixed(2)
  }

  // Sort function for table columns
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Filter and sort vehicles
  const filteredVehicles = vehicles
    .filter(
      (vehicle) =>
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })

  // Add a new vehicle with leasing details
  const addVehicle = () => {
    const newVehicle = {
      id: vehicles.length + 1,
      name: "New Vehicle",
      price: leasingParams.vehiclePrice,
      monthlyPayment: Number.parseFloat(calculateMonthlyPayment()),
      remainingPayments: leasingParams.term,
      nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Pending",
    }

    setVehicles([...vehicles, newVehicle])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center">
      <main className="w-full max-w-lg px-4 py-12 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg text-white">
            Leasing Calculator
          </h2>
        </motion.div>
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 w-full">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
            <CardTitle className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <CreditCard className="mr-2 h-6 w-6 text-blue-600" />
              Calculate Your Monthly Payment
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-300">Enter your leasing details below</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="vehicle-price">Vehicle Price</Label>
                <span className="font-medium">${leasingParams.vehiclePrice.toLocaleString()}</span>
              </div>
              <Slider
                id="vehicle-price"
                min={10000}
                max={200000}
                step={1000}
                value={[leasingParams.vehiclePrice]}
                onValueChange={(value) => setLeasingParams({ ...leasingParams, vehiclePrice: value[0] })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="down-payment">Down Payment</Label>
                <span className="font-medium">${leasingParams.downPayment.toLocaleString()}</span>
              </div>
              <Slider
                id="down-payment"
                min={0}
                max={leasingParams.vehiclePrice / 2}
                step={500}
                value={[leasingParams.downPayment]}
                onValueChange={(value) => setLeasingParams({ ...leasingParams, downPayment: value[0] })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="term">Lease Term</Label>
              <Select
                value={leasingParams.term.toString()}
                onValueChange={(value) => setLeasingParams({ ...leasingParams, term: Number.parseInt(value) })}
              >
                <SelectTrigger id="term">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 months</SelectItem>
                  <SelectItem value="36">36 months</SelectItem>
                  <SelectItem value="48">48 months</SelectItem>
                  <SelectItem value="60">60 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                <span className="font-medium">{leasingParams.interestRate}%</span>
              </div>
              <Slider
                id="interest-rate"
                min={1}
                max={10}
                step={0.1}
                value={[leasingParams.interestRate]}
                onValueChange={(value) => setLeasingParams({ ...leasingParams, interestRate: value[0] })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-b-xl">
            <div className="w-full p-4 rounded-lg flex flex-col items-center">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Estimated Monthly Payment</span>
              <span className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 drop-shadow">${calculateMonthlyPayment()}</span>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

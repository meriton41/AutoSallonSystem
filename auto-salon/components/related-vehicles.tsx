import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface RelatedVehiclesProps {
  currentVehicleId: string
}

export default function RelatedVehicles({ currentVehicleId }: RelatedVehiclesProps) {
  // In a real app, this would be filtered based on the current vehicle
  const relatedVehicles = [
    {
      id: "2",
      title: "Ferrari Purosangue",
      image: "/images/cars/ferrari-purosangue.jpg",
      year: 2024,
      mileage: "1000 km",
      brand: "Ferrari",
      brandLogo: "/images/brands/ferrari.png",
    },
    {
      id: "3",
      title: "Mercedes-Benz SL 63 AMG",
      image: "/images/cars/mercedes-sl.jpg",
      year: 2023,
      mileage: "2500 km",
      brand: "Mercedes-Benz",
      brandLogo: "/images/brands/mercedes.png",
    },
    {
      id: "4",
      title: "Bentley Continental GT",
      image: "/images/cars/bentley-continental.jpg",
      year: 2024,
      mileage: "100 km",
      brand: "Bentley",
      brandLogo: "/images/brands/bentley.png",
    },
  ].filter((vehicle) => vehicle.id !== currentVehicleId)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {relatedVehicles.map((vehicle) => (
        <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
          <Card className="car-card h-full">
            <div className="relative h-48 w-full">
              <Image
                src={vehicle.image || "/placeholder.svg"}
                alt={vehicle.title}
                fill
                className="object-cover transition-transform duration-300"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <Image
                  src={vehicle.brandLogo || "/placeholder.svg"}
                  alt={vehicle.brand}
                  width={30}
                  height={20}
                  className="mr-2"
                />
                <h3 className="text-lg font-bold">{vehicle.title}</h3>
              </div>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{vehicle.year}</span>
                <span>{vehicle.mileage}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}


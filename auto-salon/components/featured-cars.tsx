import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function FeaturedCars() {
  const featuredCars = [
    {
      id: 1,
      title: "Rolls Royce Cullinan II",
      image: "/images/cars/rolls-royce-cullinan.jpg",
      year: 2025,
      mileage: "0 km",
      brand: "Rolls Royce",
      brandLogo: "/images/brands/rolls-royce.png",
      isNew: true,
    },
    {
      id: 2,
      title: "Ferrari Purosangue",
      image: "/images/cars/ferrari-purosangue.jpg",
      year: 2024,
      mileage: "1000 km",
      brand: "Ferrari",
      brandLogo: "/images/brands/ferrari.png",
      isNew: false,
    },
    {
      id: 3,
      title: "Mercedes-Benz SL 63 AMG",
      image: "/images/cars/mercedes-sl.jpg",
      year: 2023,
      mileage: "2500 km",
      brand: "Mercedes-Benz",
      brandLogo: "/images/brands/mercedes.png",
      isNew: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {featuredCars.map((car) => (
        <Link key={car.id} href={`/vehicles/${car.id}`}>
          <Card className="car-card h-full">
            <div className="relative h-64 w-full">
              <Image
                src={car.image || "/placeholder.svg"}
                alt={car.title}
                fill
                className="object-cover transition-transform duration-300"
              />
              {car.isNew && <Badge className="absolute top-2 left-2 z-10">New</Badge>}
            </div>
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <Image
                  src={car.brandLogo || "/placeholder.svg"}
                  alt={car.brand}
                  width={40}
                  height={30}
                  className="mr-2"
                />
                <h3 className="text-xl font-bold">{car.title}</h3>
              </div>
              <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                <span>{car.year}</span>
                <span>{car.mileage}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}


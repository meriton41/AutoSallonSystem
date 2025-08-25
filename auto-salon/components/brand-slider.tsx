import Image from "next/image"
import Link from "next/link"

export default function BrandSlider() {
  const brands = [
    { name: "Lamborghini", logo: "/images/brands/lamborghini.png", href: "/vehicles?brand=lamborghini" },
    { name: "Ferrari", logo: "/images/brands/ferrari.png", href: "/vehicles?brand=ferrari" },
    { name: "Rolls Royce", logo: "/images/brands/rolls-royce.png", href: "/vehicles?brand=rolls-royce" },
    { name: "BMW", logo: "/images/brands/bmw.png", href: "/vehicles?brand=bmw" },
    { name: "Mercedes-Benz", logo: "/images/brands/mercedes.png", href: "/vehicles?brand=mercedes" },
    { name: "Bentley", logo: "/images/brands/bentley.png", href: "/vehicles?brand=bentley" },
    { name: "Audi", logo: "/images/brands/audi.png", href: "/vehicles?brand=audi" },
    { name: "Porsche", logo: "/images/brands/porsche.png", href: "/vehicles?brand=porsche" },
    { name: "Volkswagen", logo: "/images/brands/volkswagen.png", href: "/vehicles?brand=volkswagen" },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-8 md:gap-12">
      {brands.map((brand) => (
        <Link key={brand.name} href={brand.href} className="group">
          <Image
            src={brand.logo || "/placeholder.svg"}
            alt={brand.name}
            width={100}
            height={60}
            className="brand-logo"
          />
        </Link>
      ))}
    </div>
  )
}


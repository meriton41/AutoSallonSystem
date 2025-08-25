import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import BrandSlider from "@/components/brand-slider"
import FeaturedCars from "@/components/featured-cars"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
<div className="flex flex-col">
  {/* Hero Section */}
  <section className="hero-section h-[80vh] relative">
    <Image src="/images/fotop.jpg" alt="Luxury Lamborghini" fill className="object-cover opacity-70" priority />
    <div className="hero-content container mx-auto px-4 h-full flex flex-col justify-center items-start relative z-10">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-6xl md:text-9xl font-bold text-white drop-shadow-lg">
        Nitron
        </h1>
        <p className="text-3xl md:text-4xl text-white font-medium drop-shadow-md">
          The leader in luxury vehicles since 1995
        </p>
        <p className="text-white text-xl font-light drop-shadow-sm">
          Explore our range of vehicles from economy to exclusive luxury class.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/vehicles">
            <span className="inline-flex items-center space-x-2  font-semibold">
              <span>View Our Vehicles</span>
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </Button>
      </div>
    </div>
  </section>

      {/* About Section */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">About  Nitron</h2>
              <p className="mb-4">
                With pleasure we present  Nitron, the leader in the region with experience in the market of
                vehicles since 1995.
              </p>
              <p className="mb-6">Browse our wide range of vehicles from economy to exclusive luxury class.</p>
              <Button asChild>
                <Link href="/about">Learn More About Us</Link>
              </Button>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image src="/images/cars/urus.jpg" alt=" Nitron Showroom" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Find Your Dream Car Today</h2>
          <p className="text-white mb-8 max-w-2xl mx-auto">
            Our expert team is ready to help you find the perfect vehicle that matches your style and needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/vehicles">Browse Inventory</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}


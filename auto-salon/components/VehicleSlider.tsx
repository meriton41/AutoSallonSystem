import React, { useState } from "react";
import Image from "next/image";

export type Vehicle = {
  id: number;
  title: string;
  image: string;
  year: number;
  brand: string;
  price: number;
};

interface VehicleSliderProps {
  vehicles: Vehicle[];
}

export default function VehicleSlider({ vehicles }: VehicleSliderProps) {
  const [current, setCurrent] = useState(0);
  const total = vehicles.length;

  const goToPrev = () => setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  const goToNext = () => setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));

  if (total === 0) return <div className="text-center py-8">No vehicles to show.</div>;

  const vehicle = vehicles[current];
  const imageUrl = vehicle.image && vehicle.image.split(",")[0] !== "string"
    ? vehicle.image.split(",")[0]
    : "/placeholder.svg";

  return (
    <div className="relative w-full max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col items-center">
      <div className="relative w-full h-64 flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={vehicle.title}
          fill
          className="object-cover rounded-lg"
        />
        <button
          onClick={goToPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white rounded-full p-2 z-10"
          aria-label="Previous vehicle"
        >
          &#8592;
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white rounded-full p-2 z-10"
          aria-label="Next vehicle"
        >
          &#8594;
        </button>
      </div>
      <div className="mt-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{vehicle.title}</h3>
        <div className="text-gray-700 dark:text-gray-300 mb-1">{vehicle.brand} &bull; {vehicle.year}</div>
        <div className="text-blue-600 dark:text-blue-400 text-lg font-semibold">€{vehicle.price.toLocaleString()}</div>
      </div>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {current + 1} / {total}
      </div>
    </div>
  );
} 
export interface CarInsurance {
  id: string;
  policyNumber: string;
  carId: string;
  vehicleId?: number; // Backend uses vehicleId instead of carId
  clientName: string;
  clientEmail: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  coverageDetails: string;
  price: number;
  Vehicle?: {
    id: number;
    title: string;
    brand: string;
    year: number;
    color: string;
    interiorColor: string;
    engine: string;
    fuel: string;
    power: string;
    transmission: string;
    mileage: string;
  };
}

export interface Bill {
  id: string;  // This will be a string representation of the Guid
  clientName: string;
  clientEmail: string;
  vehicleId: number;
  amount: number;
  description: string;
  date: string; // ISO string
}

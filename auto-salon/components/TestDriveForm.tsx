"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: number;
  title: string;
  make: string;
  model: string;
  year: number;
  engine: string;
  fuel: string;
  transmission: string;
  imageUrl?: string;
}

interface TestDriveFormData {
  vehicleId: number;
  description: string;
  date: Date;
  status: string;
}

interface TestDriveFormProps {
  vehicleId: number;
  onSuccess?: () => void;
}

export default function TestDriveForm({ vehicleId, onSuccess }: TestDriveFormProps) {
  const { token, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Date[]>([]);
  const [formData, setFormData] = useState<TestDriveFormData>({
    vehicleId: vehicleId || 0,
    description: '',
    date: new Date(),
    status: 'Pending'
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch available vehicles
    const fetchVehicles = async () => {
      try {
        const response = await fetch('https://localhost:7234/api/Vehicles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Map backend Image to imageUrl
          const mapped = data.map((v: any) => ({
            ...v,
            imageUrl: v.Image || v.image || v.imageUrl // fallback if needed
          }));
          setVehicles(mapped);
        }
      } catch (err) {
        setError('Failed to fetch vehicles');
      }
    };

    fetchVehicles();
  }, [isAuthenticated, token, router]);

  // Fetch booked slots when vehicle changes
  const fetchBookedSlots = async (vehicleId: number, date: Date) => {
    if (!vehicleId || !date) {
      console.log('Skipping fetch - missing vehicleId or date');
      return;
    }

    try {
      // Format the date to YYYY-MM-DD format
      const formattedDate = date.toISOString().split('T')[0];
      const url = `https://localhost:7234/api/TestDrive/available-slots/${vehicleId}/${formattedDate}`;
      
      console.log('Fetching booked slots for:', { vehicleId, date: formattedDate, url });
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Don't show error for 404 - it's expected when no slots are booked
        if (response.status !== 404) {
          let errorMessage = 'Failed to fetch booked slots';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            console.error('Error parsing error response:', jsonError);
          }
          console.error('Failed to fetch booked slots:', errorMessage);
          setError(errorMessage);
        }
        setBookedSlots([]); // Clear booked slots on error
        return;
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      if (!data.bookedSlots) {
        setBookedSlots([]); // Clear booked slots if none are returned
        return;
      }

      const bookedSlots = data.bookedSlots.map((slot: string) => new Date(slot));
      console.log('Processed booked slots:', bookedSlots);
      setBookedSlots(bookedSlots);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error in fetchBookedSlots:', err);
      setBookedSlots([]); // Clear booked slots on error
      // Only set error if it's not a network error
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        console.log('Network error - skipping error message');
      } else {
        setError('Failed to fetch booked slots. Please try again.');
      }
    }
  };

  const handleVehicleChange = async (value: string) => {
    const newVehicleId = parseInt(value);
    setFormData(prev => ({ ...prev, vehicleId: newVehicleId }));
    if (newVehicleId && formData.date) {
      await fetchBookedSlots(newVehicleId, formData.date);
    }
  };

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;

    // Set the time to 1:00 AM by default
    const newDate = new Date(date);
    newDate.setHours(1, 0, 0, 0);
    setFormData(prev => ({ ...prev, date: newDate }));
    
    if (formData.vehicleId) {
      await fetchBookedSlots(formData.vehicleId, newDate);
    }
  };

  const handleTimeSelect = async (hour: number) => {
    // Check if the slot is already booked
    if (isTimeSlotBooked(hour)) {
      setError('This time slot is already booked. Please select a different time.');
      return;
    }

    const newDate = new Date(formData.date);
    newDate.setHours(hour, 0, 0, 0);
    setFormData(prev => ({ ...prev, date: newDate }));
    
    if (formData.vehicleId) {
      await fetchBookedSlots(formData.vehicleId, newDate);
    }
  };

  const isTimeSlotBooked = (hour: number) => {
    return bookedSlots.some(slot => 
      slot.getDate() === formData.date.getDate() &&
      slot.getMonth() === formData.date.getMonth() &&
      slot.getFullYear() === formData.date.getFullYear() &&
      slot.getHours() === hour
    );
  };

  const getAvailableTimeSlots = () => {
    return [1, 2, 3, 4].filter(hour => !isTimeSlotBooked(hour));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Check if the selected time slot is already booked
    if (isTimeSlotBooked(formData.date.getHours())) {
      setError('This time slot is already booked. Please select a different time.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('https://localhost:7234/api/TestDrive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: formData.vehicleId,
          description: formData.description,
          date: formData.date.toISOString(),
          status: formData.status
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Test drive scheduled successfully!');
        setFormData({
          vehicleId: vehicleId || 0,
          description: '',
          date: new Date(),
          status: 'Pending'
        });
        if (onSuccess) {
          onSuccess();
        }
        router.push('/dashboard/test-drive-management');
      } else {
        setError(data.message || 'Failed to schedule test drive');
        // Refresh the booked slots after a failed attempt
        if (formData.vehicleId) {
          await fetchBookedSlots(formData.vehicleId, formData.date);
        }
      }
    } catch (err) {
      setError('An error occurred while scheduling the test drive');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Schedule a Test Drive</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Select Vehicle</Label>
            <Select
              value={formData.vehicleId.toString()}
              onValueChange={handleVehicleChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                    <div className="flex items-center gap-3">
                      {vehicle.imageUrl && (
                        <img
                          src={vehicle.imageUrl}
                          alt={vehicle.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold">{vehicle.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {vehicle.year} • {vehicle.engine} • {vehicle.transmission}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Date and Time</Label>
            <div className="text-sm text-muted-foreground mb-2">
              Available times: 1:00 AM, 2:00 AM, 3:00 AM, 4:00 AM (Weekdays only)
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP 'at' h:mm a") : "Pick a date and time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) => {
                    const day = date.getDay();
                    return day === 0 || day === 6; // Disable weekends
                  }}
                />
                <div className="p-3 border-t">
                  <div className="grid grid-cols-2 gap-2">
                    {getAvailableTimeSlots().map((hour) => (
                      <Button
                        key={hour}
                        variant="outline"
                        className={cn(
                          "justify-start",
                          formData.date.getHours() === hour && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => handleTimeSelect(hour)}
                      >
                        {hour}:00 AM
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Notes</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Any specific requirements or questions?"
              className="min-h-[100px]"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isTimeSlotBooked(formData.date.getHours())}
          >
            <Car className="mr-2 h-4 w-4" />
            {isSubmitting ? "Scheduling..." : "Schedule Test Drive"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
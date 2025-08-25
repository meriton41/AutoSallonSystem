"use client";

import TestDriveForm from "@/components/TestDriveForm";

export default function TestDrivePage() {
  return (
    <div className="container mx-auto py-8">
      {/* <h1 className="text-3xl font-bold mb-6 text-center">Schedule a Test Drive</h1> */}
      <TestDriveForm vehicleId={0} />
    </div>
  );
} 
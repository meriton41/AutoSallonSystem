"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TestDriveTable from '../../../components/TestDriveTable';
import { useAuth } from '../../../context/auth-context';

export default function AdminTestDrivesPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TestDriveTable />
    </div>
  );
} 
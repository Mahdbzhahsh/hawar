"use client";

import { useState, useEffect } from 'react';
import { AuthProvider } from './AuthContext';
import { PatientProvider } from './PatientContext';
import ProtectedRoute from '../components/ProtectedRoute';

export default function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // Use useEffect to handle client-side only code
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side
  // This prevents hydration errors
  if (!mounted) {
    return null;
  }

  return (
    <AuthProvider>
      <PatientProvider>
        <ProtectedRoute>{children}</ProtectedRoute>
      </PatientProvider>
    </AuthProvider>
  );
} 
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DatabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        // Try to query the patients table
        const { data, error } = await supabase
          .from('patients')
          .select('id')
          .limit(1);

        if (error) {
          console.error('Database connection error:', error);
          setStatus('error');
          setErrorMessage(`Database error: ${error.message}`);
          return;
        }

        // If we get here, connection is successful
        setStatus('connected');
      } catch (err) {
        console.error('Error checking database connection:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    checkConnection();
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Checking database connection...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-500">
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Database connection error: {errorMessage}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-500">
      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>Database connected</span>
    </div>
  );
} 
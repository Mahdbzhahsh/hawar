"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseSetupGuide() {
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkDatabase() {
      try {
        // Check if the patients table exists
        const { error } = await supabase
          .from('patients')
          .select('id')
          .limit(1);
        
        // If there's an error, likely the table doesn't exist
        if (error && error.code === 'PGRST116') {
          setShowGuide(true);
        }
      } catch (err) {
        console.error('Error checking database:', err);
        setShowGuide(true);
      } finally {
        setLoading(false);
      }
    }
    
    checkDatabase();
  }, []);

  if (loading) return null;
  
  if (!showGuide) return null;

  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">Database Setup Required</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              It appears that your Supabase database is not properly set up. Please follow these steps:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Go to your <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Supabase Dashboard</a></li>
              <li>Select your project</li>
              <li>Navigate to the SQL Editor</li>
              <li>Create a new query</li>
              <li>Copy and paste the following SQL:</li>
            </ol>
            <pre className="mt-2 p-2 bg-amber-100 rounded text-xs overflow-auto">
              {`CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age TEXT,
  hospital_file_number TEXT,
  mobile_number TEXT,
  sex TEXT,
  age_of_diagnosis TEXT,
  diagnosis TEXT,
  treatment TEXT,
  response TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own patients
CREATE POLICY "Users can view their own patients" 
  ON public.patients 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own patients
CREATE POLICY "Users can insert their own patients" 
  ON public.patients 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own patients
CREATE POLICY "Users can update their own patients" 
  ON public.patients 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own patients
CREATE POLICY "Users can delete their own patients" 
  ON public.patients 
  FOR DELETE 
  USING (auth.uid() = user_id);`}
            </pre>
            <p className="mt-2">
              After running the SQL, refresh this page to start using the application with your Supabase database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
-- Drop the existing table if it has foreign key constraints
DROP TABLE IF EXISTS public.patients;

-- Create patients table without foreign key constraints
CREATE TABLE public.patients (
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

-- First, create a policy to allow authenticated users to see their own patients
CREATE POLICY "Users can view their own patients" 
  ON public.patients 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow authenticated users to insert their own patients
CREATE POLICY "Users can insert their own patients" 
  ON public.patients 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow authenticated users to update their own patients
CREATE POLICY "Users can update their own patients" 
  ON public.patients 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow authenticated users to delete their own patients
CREATE POLICY "Users can delete their own patients" 
  ON public.patients 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create special admin policies for the admin user (using the zero UUID)
-- Admin view policy
CREATE POLICY "Admin can view all patients" 
  ON public.patients 
  FOR SELECT 
  USING (user_id = '00000000-0000-0000-0000-000000000000');

-- Admin insert policy
CREATE POLICY "Admin can insert patients" 
  ON public.patients 
  FOR INSERT 
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000');

-- Admin update policy
CREATE POLICY "Admin can update all patients" 
  ON public.patients 
  FOR UPDATE 
  USING (user_id = '00000000-0000-0000-0000-000000000000');

-- Admin delete policy
CREATE POLICY "Admin can delete all patients" 
  ON public.patients 
  FOR DELETE 
  USING (user_id = '00000000-0000-0000-0000-000000000000');

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS patients_user_id_idx ON public.patients (user_id);

-- Refresh the schema cache to ensure all columns are recognized
NOTIFY pgrst, 'reload schema'; 
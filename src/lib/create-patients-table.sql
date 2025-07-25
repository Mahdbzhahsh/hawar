-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
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
  USING (auth.uid() = user_id);

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS patients_user_id_idx ON public.patients (user_id); 
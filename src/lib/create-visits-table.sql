-- Create the visits table
CREATE TABLE IF NOT EXISTS visits (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Create an index for better performance when querying visits by patient_id
CREATE INDEX IF NOT EXISTS visits_patient_id_idx ON visits (patient_id);

-- Create an index for better performance when querying visits by created_at
CREATE INDEX IF NOT EXISTS visits_created_at_idx ON visits (created_at);

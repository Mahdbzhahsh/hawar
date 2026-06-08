import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fall back to hardcoded values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://guuhuookghgjwfljsolq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dWh1b29rZ2hnandmbGpzb2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDI5NjksImV4cCI6MjA2OTAxODk2OX0.yd1XGuSydXY7rAZPvHMVLPPG0zD-rPJgqLmrmKGvZFM';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

// Function to ensure the patients table exists
export async function ensurePatientsTableExists() {
  try {
    // First check if the table exists by trying to select from it
    const { error: checkError } = await supabase
      .from('patients')
      .select('id')
      .limit(1);

    if (checkError) {
      console.log('Patients table may not exist, attempting to create it...');

      // Create the table using SQL (requires service role key in production)
      // For this example, we'll rely on the table being created in the Supabase dashboard
      console.error('Please create the patients table in your Supabase dashboard with the following columns:');
      console.error('- id: uuid (primary key, default: uuid_generate_v4())');
      console.error('- name: text');
      console.error('- dob: text');
      console.error('- hospital_file_number: text');
      console.error('- mobile_number: text');
      console.error('- sex: text');
      console.error('- age_of_diagnosis: text');
      console.error('- diagnosis: text');
      console.error('- treatment: text');
      console.error('- current_treatment: text');
      console.error('- clinic_id: text');
      console.error('- response: text');
      console.error('- note: text');
      console.error('- follow_up_date: text');
      console.error('- table_data: text');
      console.error('- image_url: text');
      console.error('- imaging: text');
      console.error('- ultrasound: text');
      console.error('- lab_text: text');
      console.error('- report: text');
      console.error('- created_at: timestamp with time zone (default: now())');
      console.error('- user_id: uuid');

      return false;
    }

    // Ensure the public RPC function exists for sharing links
    try {
      const { error: rpcError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION public.get_patient_by_id_public(patient_id uuid)
          RETURNS TABLE (
            id uuid,
            name text,
            dob text,
            hospital_file_number text,
            mobile_number text,
            sex text,
            age_of_diagnosis text,
            diagnosis text,
            treatment text,
            current_treatment text,
            clinic_id text,
            response text,
            note text,
            follow_up_date text,
            table_data text,
            image_url text,
            imaging text,
            ultrasound text,
            lab_text text,
            report text,
            created_at timestamp with time zone,
            user_id uuid
          ) 
          SECURITY DEFINER
          AS $$
          BEGIN
            RETURN QUERY
            SELECT 
              p.id,
              p.name,
              p.dob,
              p.hospital_file_number,
              p.mobile_number,
              p.sex,
              p.age_of_diagnosis,
              p.diagnosis,
              p.treatment,
              p.current_treatment,
              p.clinic_id,
              p.response,
              p.note,
              p.follow_up_date,
              p.table_data,
              p.image_url,
              p.imaging,
              p.ultrasound,
              p.lab_text,
              p.report,
              p.created_at,
              p.user_id
            FROM public.patients p
            WHERE p.id = patient_id;
          END;
          $$ LANGUAGE plpgsql;
        `
      });
      if (rpcError) {
        console.error('Error creating get_patient_by_id_public RPC:', rpcError);
      } else {
        console.log('Successfully verified/created get_patient_by_id_public RPC');
      }
    } catch (rpcErr) {
      console.error('Failed to run rpc get_patient_by_id_public verification:', rpcErr);
    }

    return true;
  } catch (error) {
    console.error('Error checking/creating patients table:', error);
    return false;
  }
}

// Function to ensure the visits table exists
export async function ensureVisitsTableExists() {
  try {
    const { error: checkError } = await supabase
      .from('visits')
      .select('id')
      .limit(1);

    if (checkError) {
      console.log('Visits table may not exist, attempting to create it...');

      // Try creating the table if it doesn't exist
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS visits (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
            created_at timestamp with time zone DEFAULT now()
          );
          CREATE INDEX IF NOT EXISTS visits_patient_id_idx ON visits (patient_id);
          CREATE INDEX IF NOT EXISTS visits_created_at_idx ON visits (created_at);
        `
      });

      if (createError) {
        console.error('Failed to create visits table automatically:', createError);
        console.error('Create the visits table in Supabase with:');
        console.error('- id: uuid (primary key, default: uuid_generate_v4())');
        console.error('- patient_id: uuid (foreign key to patients.id)');
        console.error('- created_at: timestamp with time zone (default: now())');
        return false;
      }

      // Verify creation was successful
      const { error: verifyError } = await supabase
        .from('visits')
        .select('id')
        .limit(1);

      if (verifyError) {
        console.error('Visits table creation verification failed:', verifyError);
        return false;
      }

      console.log('Visits table created successfully');
      return true;
    }
    return true;
  } catch (error) {
    console.error('Error checking/creating visits table:', error);
    return false;
  }
}
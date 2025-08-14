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
      console.error('- age: text');
      console.error('- hospital_file_number: text');
      console.error('- mobile_number: text');
      console.error('- sex: text');
      console.error('- age_of_diagnosis: text');
      console.error('- diagnosis: text');
      console.error('- treatment: text');
      console.error('- response: text');
      console.error('- note: text');
      console.error('- created_at: timestamp with time zone (default: now())');
      console.error('- user_id: uuid');
      
      return false;
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
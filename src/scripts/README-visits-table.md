# Visits Table Setup Guide

This guide explains how to set up the "visits" table in your Supabase database, which is required for the Reports functionality to work correctly.

## About the Visits Table

The `visits` table keeps track of patient visits to the clinic. Each time a patient is added or marked as "visited" in the patients list, a record is created in this table. The reports page uses this data to show visit statistics.

## Option 1: Automatic Creation (Recommended)

The application is configured to attempt to create the visits table automatically when needed. This should happen when:

1. A new patient is added
2. A patient is marked as visiting in the patients page
3. The reports page is loaded

If the automatic creation fails, you'll need to create the table manually (see Option 2).

## Option 2: Manual Creation in Supabase

If you need to manually create the visits table:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new SQL query
4. Paste the following SQL and execute it:

```sql
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
```

## Option 3: Using the Setup Script

You can also run the provided setup script to create the visits table:

```bash
# Set your Supabase service role key as an environment variable
export NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Run the setup script
node src/scripts/setup-visits-table.js
```

Note: You need to use the service role key (not the anon key) for this script to work.

## Verifying the Setup

After setting up the visits table:

1. Go to the Dashboard -> Patients page
2. Click on a patient and use the "Log Visit" button
3. Navigate to the Reports page
4. The visit should be counted in the "Visits Today" statistic

## Troubleshooting

If you encounter issues:

1. Check the browser console for any error messages
2. Verify the table was created correctly in your Supabase dashboard
3. Ensure the table has the correct structure (id, patient_id, created_at)

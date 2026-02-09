-- Rename age to dob if you want to preserve data, OR just add dob
-- Assuming we want to switch 'age' to 'dob' as per plan
ALTER TABLE public.patients RENAME COLUMN age TO dob;

-- Add missing columns
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS follow_up_date TEXT DEFAULT '';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS table_data TEXT DEFAULT '';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS imaging TEXT DEFAULT '';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS ultrasound TEXT DEFAULT '';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS lab_text TEXT DEFAULT '';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS report TEXT DEFAULT '';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

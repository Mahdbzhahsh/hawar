import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://guuhuookghgjwfljsolq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dWh1b29rZ2hnandmbGpzb2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDI5NjksImV4cCI6MjA2OTAxODk2OX0.yd1XGuSydXY7rAZPvHMVLPPG0zD-rPJgqLmrmKGvZFM';

export const supabase = createClient(supabaseUrl, supabaseKey); 
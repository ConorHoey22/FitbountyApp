import { createClient } from '@supabase/supabase-js';

// Replace these placeholders with your actual Supabase project credentials
// from your Supabase dashboard settings.
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

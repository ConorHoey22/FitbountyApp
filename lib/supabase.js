import { createClient } from '@supabase/supabase-js';

// Replace these placeholders with your actual Supabase project credentials
// from your Supabase dashboard settings.
const SUPABASE_URL = 'https://xuksnudylqrpufpfkgnj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1a3NudWR5bHFycHVmcGZrZ25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjI2NTAsImV4cCI6MjA3MTA5ODY1MH0.e4GYiNUd9nEzjEkigi_KeyUnxBQNsRXD6Ar5P5YXyqE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

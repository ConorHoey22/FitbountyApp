import { supabase } from './supabase';

export async function getProfile() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data, error } = await supabase
      .from('userProfiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error('getUserProfile error:', err.message);
    throw err;
  }
}
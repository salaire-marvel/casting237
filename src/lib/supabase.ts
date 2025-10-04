import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Reservation {
  id: string;
  timeslot: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  casting_date_id: string | null;
}

export interface CastingDate {
  id: string;
  date: string;
  title: string;
  is_active: boolean;
  created_at: string;
}

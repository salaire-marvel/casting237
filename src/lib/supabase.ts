import { createClient } from '@supabase/supabase-js';

// Hardcoded for testing - should be environment variables in production
const supabaseUrl = 'https://rzfrsuhgjpvmwmbmqkro.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZnJzdWhnanB2bXdtYm1xa3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NDk4OTYsImV4cCI6MjA3NTEyNTg5Nn0.ndc6Wl00Rrb5KmM5lXyo8NeZBYB2uLSfm52pEOBp2e0';

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

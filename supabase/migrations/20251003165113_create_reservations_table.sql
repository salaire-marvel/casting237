/*
  # Create casting reservations system

  1. New Tables
    - `reservations`
      - `id` (uuid, primary key) - Unique identifier for each reservation
      - `timeslot` (text) - Time slot in format "HH:MM - HH:MM"
      - `name` (text) - Candidate's full name
      - `email` (text) - Candidate's email address
      - `phone` (text) - Candidate's phone number
      - `created_at` (timestamptz) - When the reservation was created
      
  2. Security
    - Enable RLS on `reservations` table
    - Add policy for public to read all reservations (needed for slot availability)
    - Add policy for public to insert reservations (booking is public)
    
  3. Important Notes
    - This is a public booking system where anyone can view available slots and book
    - Maximum 3 candidates per time slot (enforced in application logic)
    - Real-time subscriptions will be used to keep slot availability updated
*/

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timeslot text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reservations"
  ON reservations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create reservations"
  ON reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create an index on timeslot for faster queries
CREATE INDEX IF NOT EXISTS idx_reservations_timeslot ON reservations(timeslot);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at);
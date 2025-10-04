/*
  # Add casting dates management and admin features

  1. New Tables
    - `casting_dates`
      - `id` (uuid, primary key) - Unique identifier
      - `date` (date) - The casting date
      - `title` (text) - Display title for the date
      - `is_active` (boolean) - Whether this date is currently shown
      - `created_at` (timestamptz) - When the date was created
      
  2. Changes to existing tables
    - Add `casting_date_id` column to `reservations` table
    - Add foreign key constraint linking to `casting_dates`
    
  3. Security
    - Enable RLS on `casting_dates` table
    - Add policy for public to read active dates
    - Add policy for public to insert/update/delete (will add auth later)
    - Update reservations policies to allow deletion
    
  4. Initial Data
    - Insert the default October 5, 2025 date
*/

-- Create casting_dates table
CREATE TABLE IF NOT EXISTS casting_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  title text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE casting_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active dates"
  ON casting_dates
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can manage dates"
  ON casting_dates
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Add casting_date_id to reservations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'casting_date_id'
  ) THEN
    ALTER TABLE reservations ADD COLUMN casting_date_id uuid REFERENCES casting_dates(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add delete policy for reservations
DROP POLICY IF EXISTS "Anyone can delete reservations" ON reservations;
CREATE POLICY "Anyone can delete reservations"
  ON reservations
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Add update policy for reservations
DROP POLICY IF EXISTS "Anyone can update reservations" ON reservations;
CREATE POLICY "Anyone can update reservations"
  ON reservations
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default casting date
INSERT INTO casting_dates (date, title, is_active)
VALUES ('2025-10-05', 'Dimanche 5 Octobre 2025', true)
ON CONFLICT DO NOTHING;

-- Create index on casting_date_id
CREATE INDEX IF NOT EXISTS idx_reservations_casting_date_id ON reservations(casting_date_id);
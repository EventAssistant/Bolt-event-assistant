/*
  # Create demo_leads table

  ## Purpose
  Stores lead captures from the public /demo (Quick Demo Report) feature.
  No user authentication required — anonymous visitors can insert rows.

  ## New Tables
  - `demo_leads`
    - `id` (uuid, primary key, auto-generated)
    - `name` (text) — first name entered on the demo form
    - `email` (text) — email address for sending the demo report
    - `industry` (text) — industry or type of business
    - `goal` (text) — networking goal selected from dropdown
    - `created_at` (timestamptz) — timestamp of submission

  ## Security
  - RLS enabled: table is locked by default
  - INSERT policy: allows anonymous (unauthenticated) inserts only
  - No SELECT, UPDATE, or DELETE policies for the public — leads are
    write-only from the public side; the app owner reads them via Supabase dashboard
*/

CREATE TABLE IF NOT EXISTS demo_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  goal text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE demo_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a demo lead"
  ON demo_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

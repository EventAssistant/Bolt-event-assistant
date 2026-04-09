/*
  # Create submitted_profiles table

  ## Summary
  This migration creates a table to store client networking profiles submitted
  via the public /client-intake form. These can then be loaded into the main
  app's Client Profile page for AI-powered event matching.

  ## New Tables
  - `submitted_profiles`
    - `id` (uuid, primary key) — unique identifier
    - `name` (text) — client full name
    - `industry` (text) — client's own industry
    - `title` (text) — client's job title
    - `target_prospect_description` (text) — freeform description of ideal prospect
    - `target_industries` (text[]) — array of target industry tags
    - `target_roles` (text[]) — array of target role tags
    - `company_sizes` (text[]) — selected company size options
    - `revenue_ranges` (text[]) — selected revenue range options
    - `professional_associations` (text[]) — tag list of associations
    - `pain_point_1` (text) — first pain point
    - `pain_point_2` (text) — second pain point
    - `pain_point_3` (text) — third pain point
    - `decision_drivers` (text[]) — tag list of decision drivers
    - `success_metric_1` (text) — first success metric
    - `success_metric_2` (text) — second success metric
    - `success_metric_3` (text) — third success metric
    - `geographic_area` (text) — geographic area prospect operates in
    - `submitted_at` (timestamptz) — when the form was submitted

  ## Security
  - RLS enabled
  - Public INSERT allowed (no auth required — intake form is public)
  - Authenticated users can SELECT all submissions (for the admin dashboard)
*/

CREATE TABLE IF NOT EXISTS submitted_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  target_prospect_description text NOT NULL DEFAULT '',
  target_industries text[] NOT NULL DEFAULT '{}',
  target_roles text[] NOT NULL DEFAULT '{}',
  company_sizes text[] NOT NULL DEFAULT '{}',
  revenue_ranges text[] NOT NULL DEFAULT '{}',
  professional_associations text[] NOT NULL DEFAULT '{}',
  pain_point_1 text NOT NULL DEFAULT '',
  pain_point_2 text NOT NULL DEFAULT '',
  pain_point_3 text NOT NULL DEFAULT '',
  decision_drivers text[] NOT NULL DEFAULT '{}',
  success_metric_1 text NOT NULL DEFAULT '',
  success_metric_2 text NOT NULL DEFAULT '',
  success_metric_3 text NOT NULL DEFAULT '',
  geographic_area text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE submitted_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a profile"
  ON submitted_profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all submissions"
  ON submitted_profiles
  FOR SELECT
  TO authenticated
  USING (true);

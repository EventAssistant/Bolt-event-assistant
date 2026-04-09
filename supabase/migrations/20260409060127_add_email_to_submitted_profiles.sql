/*
  # Add email column to submitted_profiles

  ## Summary
  Adds an `email` column to the `submitted_profiles` table so that client email
  addresses can be captured during the intake form submission.

  ## Changes
  - `submitted_profiles` table
    - New column: `email` (text, default empty string) — stores the client's email address

  ## Notes
  - Uses `IF NOT EXISTS` guard to be safe on re-run
  - Defaults to empty string so existing rows are not broken
  - No RLS changes needed — existing policies already cover this table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submitted_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE submitted_profiles ADD COLUMN email text NOT NULL DEFAULT '';
  END IF;
END $$;

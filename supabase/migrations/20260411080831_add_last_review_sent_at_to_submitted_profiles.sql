/*
  # Add last_review_sent_at to submitted_profiles

  ## Summary
  Adds a new nullable timestamp column `last_review_sent_at` to the
  `submitted_profiles` table to track when a profile review check-in
  email was last sent to each client. This is separate from
  `last_report_sent_at` which tracks recommendation report sends.

  ## Changes
  - `submitted_profiles`: new column `last_review_sent_at` (timestamptz, nullable)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submitted_profiles' AND column_name = 'last_review_sent_at'
  ) THEN
    ALTER TABLE submitted_profiles ADD COLUMN last_review_sent_at timestamptz DEFAULT NULL;
  END IF;
END $$;

/*
  # Add last_report_sent_at to submitted_profiles

  ## Summary
  Adds a nullable timestamp column `last_report_sent_at` to the `submitted_profiles` table.
  This is used to track when a recommendation report was last generated and emailed for each
  client profile, enabling the "processed this week" tracking feature on the Submitted Profiles page.

  ## Changes
  - `submitted_profiles`: new column `last_report_sent_at` (timestamptz, nullable, default null)

  ## Notes
  - Nullable by default — null means the client has not yet been processed this week
  - Will be set to the current timestamp when a report email is successfully sent
  - Will be reset to null for all profiles when "Clear Data" is triggered for a new week
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submitted_profiles' AND column_name = 'last_report_sent_at'
  ) THEN
    ALTER TABLE submitted_profiles ADD COLUMN last_report_sent_at timestamptz DEFAULT NULL;
  END IF;
END $$;

/*
  # Add UNIQUE constraints to uploaded_events and uploaded_organizations

  ## Summary
  Adds database-level unique constraints to prevent duplicate records from
  being inserted, regardless of what the front end does.

  ## Changes

  ### uploaded_events
  - New unique constraint on (user_id, name, start_date): prevents the same
    event (same name + same date) from being stored twice for the same user.

  ### uploaded_organizations
  - New unique constraint on (user_id, name): prevents the same organization
    name from being stored twice for the same user.

  ## Notes
  - Uses IF NOT EXISTS pattern via DO block to make migration idempotent.
  - Existing data was already deduplicated in a prior migration, so these
    constraints will apply cleanly.
  - These constraints enable INSERT ... ON CONFLICT DO NOTHING (upsert)
    patterns in application code.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uploaded_events_user_id_name_start_date_key'
  ) THEN
    ALTER TABLE uploaded_events
      ADD CONSTRAINT uploaded_events_user_id_name_start_date_key
      UNIQUE (user_id, name, start_date);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uploaded_organizations_user_id_name_key'
  ) THEN
    ALTER TABLE uploaded_organizations
      ADD CONSTRAINT uploaded_organizations_user_id_name_key
      UNIQUE (user_id, name);
  END IF;
END $$;

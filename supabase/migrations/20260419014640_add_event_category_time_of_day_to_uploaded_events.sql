/*
  # Add event_category and time_of_day to uploaded_events

  ## Summary
  Adds two new optional string columns to the `uploaded_events` table to support
  fields that were already present in CSV source data but were not being stored.

  ## New Columns
  - `uploaded_events.event_category` (text, nullable) — high-level event category,
    parsed from CSV headers: event_category, category (alt), sub_category
  - `uploaded_events.time_of_day` (text, nullable) — descriptive time period
    (e.g. "Morning", "Evening"), parsed from CSV headers: time_of_day, timeofday, time_period

  ## Notes
  - Both columns are optional (nullable with no default) to remain backwards-compatible
    with existing rows and uploads that omit these fields.
  - No RLS changes needed; existing policies on uploaded_events already cover these columns.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uploaded_events' AND column_name = 'event_category'
  ) THEN
    ALTER TABLE uploaded_events ADD COLUMN event_category text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uploaded_events' AND column_name = 'time_of_day'
  ) THEN
    ALTER TABLE uploaded_events ADD COLUMN time_of_day text;
  END IF;
END $$;

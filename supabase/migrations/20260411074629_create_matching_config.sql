/*
  # Create matching_config table

  ## Purpose
  Stores configurable key/value settings that drive the AI matching behavior.
  The primary use case is storing a "matching_instructions" entry that gets
  injected as a system-level directive into every Claude API call.

  ## New Tables
  - `matching_config`
    - `id` (uuid, primary key)
    - `key` (text, unique) — identifier for the config entry
    - `value` (text) — the config value
    - `updated_at` (timestamptz) — last modification time

  ## Default Data
  - Inserts a default "matching_instructions" row with base matching guidance

  ## Security
  - RLS enabled
  - Service role can read/write (for edge functions using service key)
  - Authenticated users can only read
*/

CREATE TABLE IF NOT EXISTS matching_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE matching_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read matching config"
  ON matching_config FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO matching_config (key, value)
VALUES (
  'matching_instructions',
  'You are an expert networking event matcher. Match clients to events and organizations based on their ideal networking targets, industries, and company size preferences. Prioritize quality of match over quantity.'
)
ON CONFLICT (key) DO NOTHING;

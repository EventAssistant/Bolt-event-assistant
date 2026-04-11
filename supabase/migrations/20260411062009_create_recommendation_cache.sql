/*
  # Create recommendation_cache table

  1. New Tables
    - `recommendation_cache`
      - `id` (uuid, primary key) - unique row identifier
      - `cache_key` (text, unique) - hash of profile + events data for cache lookup
      - `result` (jsonb) - the full JSON result from the AI matching engine
      - `client_profile_id` (uuid, nullable) - references the submitted profile if applicable
      - `created_at` (timestamptz) - when this cache entry was created

  2. Security
    - Enable RLS on `recommendation_cache` table
    - Add policy for authenticated users to read cache entries they created
    - Add policy for authenticated users to insert new cache entries
    - Add policy for authenticated users to delete cache entries

  3. Important Notes
    - The cache_key is a SHA-256 hash combining the client profile fields and the events dataset
    - Cache entries older than 7 days are considered stale and will be bypassed by the edge function
    - Clearing uploaded data also clears all cache entries via a delete policy
*/

CREATE TABLE IF NOT EXISTS recommendation_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_profile_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_cache_key ON recommendation_cache (cache_key);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_created ON recommendation_cache (created_at);

ALTER TABLE recommendation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cache"
  ON recommendation_cache
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert cache"
  ON recommendation_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete cache"
  ON recommendation_cache
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

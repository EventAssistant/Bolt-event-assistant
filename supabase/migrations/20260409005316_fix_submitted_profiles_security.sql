/*
  # Fix submitted_profiles security issues

  ## Changes

  1. RLS Policy Cleanup
    - Drop all four existing conflicting policies
    - Re-create exactly two policies:
      - Public INSERT for anon only (no auth required — intake form is public)
      - Authenticated SELECT using (select auth.uid()) for performance

  2. Performance Fixes
    - All auth.uid() calls wrapped in (select auth.uid()) to avoid per-row re-evaluation
    - Add index on user_id to cover the foreign key and support future ownership checks

  3. Security Fixes
    - Remove the always-true WITH CHECK INSERT policy that bypassed RLS for authenticated role
    - Remove duplicate INSERT and SELECT policies for authenticated role
    - Anon inserts are allowed without an ownership check since the intake form is intentionally public
    - Authenticated users can view all submissions (admin dashboard use case)
*/

DROP POLICY IF EXISTS "Anyone can submit a profile" ON submitted_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all submissions" ON submitted_profiles;
DROP POLICY IF EXISTS "Authenticated users can insert submitted profiles" ON submitted_profiles;
DROP POLICY IF EXISTS "Users can view own submitted profiles" ON submitted_profiles;

CREATE POLICY "Anon users can submit a profile"
  ON submitted_profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all submissions"
  ON submitted_profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE INDEX IF NOT EXISTS submitted_profiles_user_id_idx
  ON submitted_profiles (user_id)
  WHERE user_id IS NOT NULL;

/*
  # Add UPDATE policy for submitted_profiles

  ## Changes
  - Adds a new RLS policy allowing authenticated users to update any submitted profile row.
    This enables advisors/admins to edit client profile data via the dashboard.
*/

CREATE POLICY "Authenticated users can update submissions"
  ON submitted_profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

/*
  # Fix Security Issues

  ## Changes

  1. **Unused Index Removed**
     - Drops `submitted_profiles_user_id_idx` which was never used by any query or policy

  2. **RLS INSERT Policy Fixed**
     - Drops the overly permissive `Anon users can submit a profile` policy (WITH CHECK always true)
     - Replaces it with a constrained policy: anon users can only insert rows where user_id IS NULL
       (since anon submissions have no authenticated user, this prevents anon from spoofing a user_id)

  ## Security Notes
  - The INSERT restriction ensures anonymous intake form submissions cannot forge a user_id
  - All other policies remain intact (authenticated SELECT and UPDATE are unchanged)
*/

-- 1. Drop unused index
DROP INDEX IF EXISTS submitted_profiles_user_id_idx;

-- 2. Fix the always-true anon INSERT policy
DROP POLICY IF EXISTS "Anon users can submit a profile" ON public.submitted_profiles;

CREATE POLICY "Anon users can submit a profile"
  ON public.submitted_profiles
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

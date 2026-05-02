/*
  # Fix Security Issues

  ## Summary
  Addresses all Supabase security advisor warnings:

  1. **demo_leads INSERT policy** — replaces the always-true WITH CHECK clause with a
     constraint that validates the submitted data is non-empty, preventing truly
     unrestricted anonymous inserts.

  2. **Revoke anon SELECT** — removes SELECT privilege from the `anon` role on all
     tables that should not be publicly discoverable via GraphQL:
     - demo_leads
     - matching_config
     - recommendation_cache
     - submitted_profiles
     - uploaded_events
     - uploaded_organizations
     - user_settings

  3. **Revoke authenticated SELECT** — removes the broad default SELECT privilege from
     the `authenticated` role on the same tables. RLS policies on each table already
     grant the correct per-user access; the table-level privilege grant is not needed
     and exposes the tables in the GraphQL schema to every signed-in account.
*/

-- 1. Fix demo_leads INSERT policy: replace always-true check with a meaningful constraint
DROP POLICY IF EXISTS "Anyone can insert a demo lead" ON demo_leads;

CREATE POLICY "Anon can insert demo lead with valid data"
  ON demo_leads
  FOR INSERT
  TO anon
  WITH CHECK (
    length(trim(name)) > 0
    AND length(trim(email)) > 0
    AND email LIKE '%@%'
  );

-- 2. Revoke anon SELECT from all affected tables
REVOKE SELECT ON TABLE public.demo_leads FROM anon;
REVOKE SELECT ON TABLE public.matching_config FROM anon;
REVOKE SELECT ON TABLE public.recommendation_cache FROM anon;
REVOKE SELECT ON TABLE public.submitted_profiles FROM anon;
REVOKE SELECT ON TABLE public.uploaded_events FROM anon;
REVOKE SELECT ON TABLE public.uploaded_organizations FROM anon;
REVOKE SELECT ON TABLE public.user_settings FROM anon;

-- 3. Revoke authenticated SELECT from all affected tables
-- (RLS policies already control row-level access; table-level grant is unnecessary)
REVOKE SELECT ON TABLE public.demo_leads FROM authenticated;
REVOKE SELECT ON TABLE public.matching_config FROM authenticated;
REVOKE SELECT ON TABLE public.recommendation_cache FROM authenticated;
REVOKE SELECT ON TABLE public.submitted_profiles FROM authenticated;
REVOKE SELECT ON TABLE public.uploaded_events FROM authenticated;
REVOKE SELECT ON TABLE public.uploaded_organizations FROM authenticated;
REVOKE SELECT ON TABLE public.user_settings FROM authenticated;

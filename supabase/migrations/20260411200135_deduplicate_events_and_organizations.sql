/*
  # Deduplicate uploaded_events and uploaded_organizations

  ## Summary
  Removes duplicate records from both tables, keeping only the earliest
  inserted row for each logical duplicate. No non-duplicate records are
  affected.

  ## Rules
  1. uploaded_events: duplicates defined by (name, start_date) — keep
     the row with the smallest created_at (earliest insert); on tie,
     keep the smallest id (uuid lexicographic order).
  2. uploaded_organizations: duplicates defined by (name) — same
     tie-breaking logic.

  ## Safety
  - Uses CTEs with DELETE ... WHERE id NOT IN (kept ids) — no DROP or
    TRUNCATE involved.
  - Idempotent: running again when no duplicates exist is a no-op.
*/

-- ── 1. Deduplicate uploaded_events ───────────────────────────────────────
DELETE FROM uploaded_events
WHERE id NOT IN (
  SELECT DISTINCT ON (name, start_date)
    id
  FROM uploaded_events
  ORDER BY name, start_date, created_at ASC NULLS LAST, id ASC
);

-- ── 2. Deduplicate uploaded_organizations ────────────────────────────────
DELETE FROM uploaded_organizations
WHERE id NOT IN (
  SELECT DISTINCT ON (name)
    id
  FROM uploaded_organizations
  ORDER BY name, created_at ASC NULLS LAST, id ASC
);

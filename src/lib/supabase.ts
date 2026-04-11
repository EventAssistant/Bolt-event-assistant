import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface SubmittedProfileRow {
  id: string
  name: string
  email: string
  industry: string
  title: string
  target_prospect_description: string
  target_industries: string[]
  target_roles: string[]
  company_sizes: string[]
  revenue_ranges: string[]
  professional_associations: string[]
  pain_point_1: string
  pain_point_2: string
  pain_point_3: string
  decision_drivers: string[]
  success_metric_1: string
  success_metric_2: string
  success_metric_3: string
  geographic_area: string
  submitted_at: string
  last_report_sent_at: string | null
  last_review_sent_at: string | null
}

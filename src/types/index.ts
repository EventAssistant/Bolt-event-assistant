export interface Event {
  // Primary matching fields — used actively in AI matching
  id: string
  name: string
  start_date: string
  start_time: string
  address: string
  event_type: string
  group_type: string
  paid: string
  description: string
  website: string

  // Extended fields — Reserved for future matching enhancement — available in state
  end_date: string
  end_time: string
  city_calendar: string
  event_city: string
  state: string
  zipcode: string
  group_name: string
  source: string
  notes: string
  group_id: string
  participation: string
  internal_type: string
  part_of_town: string
  subcategory: string[]
  created_at: string
  updated_at: string
}

export interface ClientProfile {
  name: string
  email: string
  industry: string
  title: string
  city: string
  networkingGoal: string
  aiNotes: string
  targetProspectDescription: string
  targetIndustries: string[]
  targetRoles: string[]
  companySizes: string[]
  revenueRanges: string[]
  professionalAssociations: string[]
  painPoint1: string
  painPoint2: string
  painPoint3: string
  decisionDrivers: string[]
  successMetric1: string
  successMetric2: string
  successMetric3: string
}

export interface EventRecommendation {
  event: Event
  matchScore: number
  matchReasons: string[]
  highlights: string[]
}

export interface Organization {
  // Primary matching fields — used actively in AI matching
  name: string
  category: string
  city: string
  description: string
  home_page: string
  internal_type: string
  notes: string

  // Extended fields — Reserved for future matching enhancement — available in state
  zip_code: string
  address: string
  calendar: string
  activity: string
  status: string
}

export interface OrgParseResult {
  organizations: Organization[]
  warnings: string[]
  totalRows: number
  skippedRows: number
}

export interface ParseResult {
  events: Event[]
  warnings: string[]
  totalRows: number
  skippedRows: number
}

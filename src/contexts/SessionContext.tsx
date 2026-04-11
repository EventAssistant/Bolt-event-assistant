import { createContext, useContext, useState, useEffect } from "react"
import type { ClientProfile, Event, Organization } from "@/types"
import { mockClientProfile } from "@/data/mockEvents"

const PROFILE_STORAGE_KEY = "active_client_profile"
const PROFILE_ID_STORAGE_KEY = "active_profile_id"
const EVENTS_STORAGE_KEY = "uploaded_events"
const ORGANIZATIONS_STORAGE_KEY = "uploaded_organizations"
const RECOMMENDATIONS_STORAGE_KEY = "ai_recommendations"
const ORG_RECOMMENDATIONS_STORAGE_KEY = "ai_org_recommendations"

export interface AIRecommendation {
  event_name: string
  why_this_event: string
  who_youll_meet: string
  what_to_do: string[]
  priority_rank: number
  matched_event?: Event
}

export interface OrgRecommendation {
  org_name: string
  category: string
  home_page: string
  calendar_link: string
  why_join: string
  who_youll_meet: string
  how_to_engage: string[]
  activity_level: string
  priority_rank: number
}

function loadStoredProfile(): ClientProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ClientProfile
      if (parsed && parsed.name) return parsed
    }
  } catch {
    // ignore
  }
  return mockClientProfile
}

function loadStoredEvents(): Event[] {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Event[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

function loadStoredOrganizations(): Organization[] {
  try {
    const raw = localStorage.getItem(ORGANIZATIONS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Organization[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

function loadStoredRecommendations(): AIRecommendation[] {
  try {
    const raw = localStorage.getItem(RECOMMENDATIONS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AIRecommendation[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

function loadStoredOrgRecommendations(): OrgRecommendation[] {
  try {
    const raw = localStorage.getItem(ORG_RECOMMENDATIONS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as OrgRecommendation[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

interface SessionContextType {
  events: Event[]
  organizations: Organization[]
  activeProfile: ClientProfile
  activeProfileId: string | null
  recommendations: AIRecommendation[]
  orgRecommendations: OrgRecommendation[]
  setEvents: (events: Event[]) => void
  setOrganizations: (organizations: Organization[]) => void
  setActiveProfile: (profile: ClientProfile, profileId?: string | null) => void
  setRecommendations: (recs: AIRecommendation[]) => void
  setOrgRecommendations: (recs: OrgRecommendation[]) => void
  clearRecommendations: () => void
  clearAll: () => void
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [events, setEventsState] = useState<Event[]>(loadStoredEvents)
  const [organizations, setOrganizationsState] = useState<Organization[]>(loadStoredOrganizations)
  const [activeProfile, setActiveProfileState] = useState<ClientProfile>(loadStoredProfile)
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(() => {
    try { return localStorage.getItem(PROFILE_ID_STORAGE_KEY) } catch { return null }
  })
  const [recommendations, setRecommendationsState] = useState<AIRecommendation[]>(loadStoredRecommendations)
  const [orgRecommendations, setOrgRecommendationsState] = useState<OrgRecommendation[]>(loadStoredOrgRecommendations)

  const setEvents = (events: Event[]) => {
    setEventsState(events)
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events))
    } catch {
      // ignore
    }
  }

  const setOrganizations = (organizations: Organization[]) => {
    setOrganizationsState(organizations)
    try {
      localStorage.setItem(ORGANIZATIONS_STORAGE_KEY, JSON.stringify(organizations))
    } catch {
      // ignore
    }
  }

  const setActiveProfile = (profile: ClientProfile, profileId?: string | null) => {
    setActiveProfileState(profile)
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // ignore
    }
    if (profileId !== undefined) {
      setActiveProfileIdState(profileId)
      try {
        if (profileId) localStorage.setItem(PROFILE_ID_STORAGE_KEY, profileId)
        else localStorage.removeItem(PROFILE_ID_STORAGE_KEY)
      } catch {
        // ignore
      }
    }
  }

  const setRecommendations = (recs: AIRecommendation[]) => {
    setRecommendationsState(recs)
    try {
      localStorage.setItem(RECOMMENDATIONS_STORAGE_KEY, JSON.stringify(recs))
    } catch {
      // ignore
    }
  }

  const setOrgRecommendations = (recs: OrgRecommendation[]) => {
    setOrgRecommendationsState(recs)
    try {
      localStorage.setItem(ORG_RECOMMENDATIONS_STORAGE_KEY, JSON.stringify(recs))
    } catch {
      // ignore
    }
  }

  const clearRecommendations = () => {
    setRecommendations([])
    setOrgRecommendations([])
  }

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(activeProfile))
    } catch {
      // ignore
    }
  }, [activeProfile])

  const clearAll = () => {
    setEvents([])
    setOrganizations([])
    setActiveProfile(mockClientProfile, null)
    setRecommendations([])
    setOrgRecommendations([])
  }

  return (
    <SessionContext.Provider value={{
      events,
      organizations,
      activeProfile,
      activeProfileId,
      recommendations,
      orgRecommendations,
      setEvents,
      setOrganizations,
      setActiveProfile,
      setRecommendations,
      setOrgRecommendations,
      clearRecommendations,
      clearAll,
    }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used within SessionProvider")
  return ctx
}

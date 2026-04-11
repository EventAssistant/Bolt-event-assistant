import { createContext, useContext, useState, useEffect, useRef } from "react"
import type { ClientProfile, Event, Organization } from "@/types"
import { mockClientProfile } from "@/data/mockEvents"
import { supabase } from "@/lib/supabase"

const PROFILE_STORAGE_KEY = "active_client_profile"
const PROFILE_ID_STORAGE_KEY = "active_profile_id"
const RECOMMENDATIONS_STORAGE_KEY = "ai_recommendations"
const ORG_RECOMMENDATIONS_STORAGE_KEY = "ai_org_recommendations"
const EVENTS_UPLOADED_AT_KEY = "events_uploaded_at"
const ORGS_UPLOADED_AT_KEY = "orgs_uploaded_at"

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

export interface UpsertResult {
  inserted: number
  skipped: number
}

interface SessionContextType {
  events: Event[]
  organizations: Organization[]
  activeProfile: ClientProfile
  activeProfileId: string | null
  recommendations: AIRecommendation[]
  orgRecommendations: OrgRecommendation[]
  eventsUploadedAt: string | null
  orgsUploadedAt: string | null
  loadingData: boolean
  setEvents: (events: Event[], uploadedAt?: string) => void
  setOrganizations: (organizations: Organization[], uploadedAt?: string) => void
  upsertEvents: (newEvents: Event[], uploadedAt?: string) => Promise<UpsertResult>
  upsertOrganizations: (newOrgs: Organization[], uploadedAt?: string) => Promise<UpsertResult>
  setActiveProfile: (profile: ClientProfile, profileId?: string | null) => void
  setRecommendations: (recs: AIRecommendation[]) => void
  setOrgRecommendations: (recs: OrgRecommendation[]) => void
  clearRecommendations: () => void
  clearAll: () => void
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [events, setEventsState] = useState<Event[]>([])
  const [organizations, setOrganizationsState] = useState<Organization[]>([])
  const [activeProfile, setActiveProfileState] = useState<ClientProfile>(loadStoredProfile)
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(() => {
    try { return localStorage.getItem(PROFILE_ID_STORAGE_KEY) } catch { return null }
  })
  const [recommendations, setRecommendationsState] = useState<AIRecommendation[]>(loadStoredRecommendations)
  const [orgRecommendations, setOrgRecommendationsState] = useState<OrgRecommendation[]>(loadStoredOrgRecommendations)
  const [eventsUploadedAt, setEventsUploadedAt] = useState<string | null>(() => {
    try { return localStorage.getItem(EVENTS_UPLOADED_AT_KEY) } catch { return null }
  })
  const [orgsUploadedAt, setOrgsUploadedAt] = useState<string | null>(() => {
    try { return localStorage.getItem(ORGS_UPLOADED_AT_KEY) } catch { return null }
  })
  const [loadingData, setLoadingData] = useState(false)
  const userRef = useRef<string | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id ?? null

      if (userId && userId !== userRef.current) {
        userRef.current = userId
        loadUserData(userId)
      } else if (!userId) {
        userRef.current = null
        setEventsState([])
        setOrganizationsState([])
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id ?? null
      if (userId) {
        userRef.current = userId
        loadUserData(userId)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserData(userId: string) {
    setLoadingData(true)
    try {
      const [eventsRes, orgsRes] = await Promise.all([
        supabase.from("uploaded_events").select("*").eq("user_id", userId),
        supabase.from("uploaded_organizations").select("*").eq("user_id", userId),
      ])

      if (eventsRes.data && eventsRes.data.length > 0) {
        const dbEvents: Event[] = eventsRes.data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          name: row.name as string,
          start_date: row.start_date as string,
          start_time: row.start_time as string,
          address: row.address as string,
          event_type: row.event_type as string,
          group_type: row.group_type as string,
          paid: row.paid as string,
          description: row.description as string,
          website: row.website as string,
          end_date: (row.end_date as string) || "",
          end_time: (row.end_time as string) || "",
          city_calendar: (row.city_calendar as string) || "",
          event_city: (row.event_city as string) || "",
          state: (row.state as string) || "",
          zipcode: (row.zipcode as string) || "",
          group_name: (row.group_name as string) || "",
          source: (row.source as string) || "",
          notes: (row.notes as string) || "",
          group_id: (row.group_id as string) || "",
          participation: (row.participation as string) || "",
          internal_type: (row.internal_type as string) || "",
          part_of_town: (row.part_of_town as string) || "",
          subcategory: (row.subcategory as string[]) || [],
          created_at: (row.created_at as string) || new Date().toISOString(),
          updated_at: (row.updated_at as string) || new Date().toISOString(),
        }))
        setEventsState(dbEvents)
      }

      if (orgsRes.data && orgsRes.data.length > 0) {
        const dbOrgs: Organization[] = orgsRes.data.map((row: Record<string, unknown>) => ({
          name: row.name as string,
          category: row.category as string,
          city: row.city as string,
          description: row.description as string,
          home_page: row.home_page as string,
          internal_type: row.internal_type as string,
          notes: row.notes as string,
          zip_code: (row.zip_code as string) || "",
          address: (row.address as string) || "",
          calendar: (row.calendar as string) || "",
          activity: (row.activity as string) || "",
          status: (row.status as string) || "",
        }))
        setOrganizationsState(dbOrgs)
      }
    } catch (error) {
      console.error("Failed to load data from database:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const setEvents = (newEvents: Event[], uploadedAt?: string) => {
    setEventsState(newEvents)

    if (uploadedAt !== undefined) {
      setEventsUploadedAt(uploadedAt)
      try {
        if (uploadedAt) localStorage.setItem(EVENTS_UPLOADED_AT_KEY, uploadedAt)
        else localStorage.removeItem(EVENTS_UPLOADED_AT_KEY)
      } catch {
        // ignore
      }
    }

    const userId = userRef.current
    if (!userId) return

    ;(async () => {
      try {
        await supabase.from("uploaded_events").delete().eq("user_id", userId)

        if (newEvents.length > 0) {
          const rows = newEvents.map((e) => ({
            user_id: userId,
            name: e.name,
            start_date: e.start_date,
            start_time: e.start_time,
            address: e.address,
            event_type: e.event_type,
            group_type: e.group_type,
            paid: e.paid,
            description: e.description,
            website: e.website,
            end_date: e.end_date,
            end_time: e.end_time,
            city_calendar: e.city_calendar,
            event_city: e.event_city,
            state: e.state,
            zipcode: e.zipcode,
            group_name: e.group_name,
            source: e.source,
            notes: e.notes,
            group_id: e.group_id,
            participation: e.participation,
            internal_type: e.internal_type,
            part_of_town: e.part_of_town,
            subcategory: e.subcategory,
          }))

          const BATCH = 500
          for (let i = 0; i < rows.length; i += BATCH) {
            const { error } = await supabase.from("uploaded_events").insert(rows.slice(i, i + BATCH))
            if (error) console.error("Failed to insert events batch:", error)
          }
        }
      } catch (error) {
        console.error("Failed to save events to database:", error)
      }
    })()
  }

  const setOrganizations = (newOrgs: Organization[], uploadedAt?: string) => {
    setOrganizationsState(newOrgs)

    if (uploadedAt !== undefined) {
      setOrgsUploadedAt(uploadedAt)
      try {
        if (uploadedAt) localStorage.setItem(ORGS_UPLOADED_AT_KEY, uploadedAt)
        else localStorage.removeItem(ORGS_UPLOADED_AT_KEY)
      } catch {
        // ignore
      }
    }

    const userId = userRef.current
    if (!userId) return

    ;(async () => {
      try {
        await supabase.from("uploaded_organizations").delete().eq("user_id", userId)

        if (newOrgs.length > 0) {
          const rows = newOrgs.map((org) => ({
            user_id: userId,
            name: org.name,
            category: org.category,
            city: org.city,
            description: org.description,
            home_page: org.home_page,
            internal_type: org.internal_type,
            notes: org.notes,
            zip_code: org.zip_code,
            address: org.address,
            calendar: org.calendar,
            activity: org.activity,
            status: org.status,
          }))

          const { error } = await supabase.from("uploaded_organizations").insert(rows)
          if (error) console.error("Failed to insert organizations:", error)
        }
      } catch (error) {
        console.error("Failed to save organizations to database:", error)
      }
    })()
  }

  const upsertEvents = async (newEvents: Event[], uploadedAt?: string): Promise<UpsertResult> => {
    const userId = userRef.current
    if (!userId) return { inserted: 0, skipped: newEvents.length }

    if (uploadedAt !== undefined) {
      setEventsUploadedAt(uploadedAt)
      try {
        if (uploadedAt) localStorage.setItem(EVENTS_UPLOADED_AT_KEY, uploadedAt)
        else localStorage.removeItem(EVENTS_UPLOADED_AT_KEY)
      } catch { }
    }

    const rows = newEvents.map((e) => ({
      user_id: userId,
      name: e.name,
      start_date: e.start_date,
      start_time: e.start_time,
      address: e.address,
      event_type: e.event_type,
      group_type: e.group_type,
      paid: e.paid,
      description: e.description,
      website: e.website,
      end_date: e.end_date,
      end_time: e.end_time,
      city_calendar: e.city_calendar,
      event_city: e.event_city,
      state: e.state,
      zipcode: e.zipcode,
      group_name: e.group_name,
      source: e.source,
      notes: e.notes,
      group_id: e.group_id,
      participation: e.participation,
      internal_type: e.internal_type,
      part_of_town: e.part_of_town,
      subcategory: e.subcategory,
    }))

    let totalInserted = 0
    const BATCH = 500
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH)
      const { data, error } = await supabase
        .from("uploaded_events")
        .upsert(batch, { onConflict: "user_id,name,start_date", ignoreDuplicates: true })
        .select("id")
      if (error) {
        console.error("Failed to upsert events batch:", error)
      } else {
        totalInserted += data?.length ?? 0
      }
    }

    const { data: allEvents } = await supabase.from("uploaded_events").select("*").eq("user_id", userId)
    if (allEvents) {
      const dbEvents: Event[] = allEvents.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: row.name as string,
        start_date: row.start_date as string,
        start_time: row.start_time as string,
        address: row.address as string,
        event_type: row.event_type as string,
        group_type: row.group_type as string,
        paid: row.paid as string,
        description: row.description as string,
        website: row.website as string,
        end_date: (row.end_date as string) || "",
        end_time: (row.end_time as string) || "",
        city_calendar: (row.city_calendar as string) || "",
        event_city: (row.event_city as string) || "",
        state: (row.state as string) || "",
        zipcode: (row.zipcode as string) || "",
        group_name: (row.group_name as string) || "",
        source: (row.source as string) || "",
        notes: (row.notes as string) || "",
        group_id: (row.group_id as string) || "",
        participation: (row.participation as string) || "",
        internal_type: (row.internal_type as string) || "",
        part_of_town: (row.part_of_town as string) || "",
        subcategory: (row.subcategory as string[]) || [],
        created_at: (row.created_at as string) || new Date().toISOString(),
        updated_at: (row.updated_at as string) || new Date().toISOString(),
      }))
      setEventsState(dbEvents)
    }

    return { inserted: totalInserted, skipped: newEvents.length - totalInserted }
  }

  const upsertOrganizations = async (newOrgs: Organization[], uploadedAt?: string): Promise<UpsertResult> => {
    const userId = userRef.current
    if (!userId) return { inserted: 0, skipped: newOrgs.length }

    if (uploadedAt !== undefined) {
      setOrgsUploadedAt(uploadedAt)
      try {
        if (uploadedAt) localStorage.setItem(ORGS_UPLOADED_AT_KEY, uploadedAt)
        else localStorage.removeItem(ORGS_UPLOADED_AT_KEY)
      } catch { }
    }

    const rows = newOrgs.map((org) => ({
      user_id: userId,
      name: org.name,
      category: org.category,
      city: org.city,
      description: org.description,
      home_page: org.home_page,
      internal_type: org.internal_type,
      notes: org.notes,
      zip_code: org.zip_code,
      address: org.address,
      calendar: org.calendar,
      activity: org.activity,
      status: org.status,
    }))

    const { data, error } = await supabase
      .from("uploaded_organizations")
      .upsert(rows, { onConflict: "user_id,name", ignoreDuplicates: true })
      .select("id")
    if (error) console.error("Failed to upsert organizations:", error)
    const totalInserted = data?.length ?? 0

    const { data: allOrgs } = await supabase.from("uploaded_organizations").select("*").eq("user_id", userId)
    if (allOrgs) {
      const dbOrgs: Organization[] = allOrgs.map((row: Record<string, unknown>) => ({
        name: row.name as string,
        category: row.category as string,
        city: row.city as string,
        description: row.description as string,
        home_page: row.home_page as string,
        internal_type: row.internal_type as string,
        notes: row.notes as string,
        zip_code: (row.zip_code as string) || "",
        address: (row.address as string) || "",
        calendar: (row.calendar as string) || "",
        activity: (row.activity as string) || "",
        status: (row.status as string) || "",
      }))
      setOrganizationsState(dbOrgs)
    }

    return { inserted: totalInserted, skipped: newOrgs.length - totalInserted }
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
    setEvents([], "")
    setOrganizations([], "")
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
      eventsUploadedAt,
      orgsUploadedAt,
      loadingData,
      setEvents,
      setOrganizations,
      upsertEvents,
      upsertOrganizations,
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

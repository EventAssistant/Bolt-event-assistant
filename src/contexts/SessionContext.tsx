import { createContext, useContext, useState, useEffect } from "react"
import type { ClientProfile, Event, Organization } from "@/types"
import { mockClientProfile } from "@/data/mockEvents"

const PROFILE_STORAGE_KEY = "active_client_profile"

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

interface SessionContextType {
  events: Event[]
  organizations: Organization[]
  activeProfile: ClientProfile
  setEvents: (events: Event[]) => void
  setOrganizations: (organizations: Organization[]) => void
  setActiveProfile: (profile: ClientProfile) => void
  clearAll: () => void
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [activeProfile, setActiveProfileState] = useState<ClientProfile>(loadStoredProfile)

  const setActiveProfile = (profile: ClientProfile) => {
    setActiveProfileState(profile)
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // ignore
    }
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
    setActiveProfile(mockClientProfile)
  }

  return (
    <SessionContext.Provider value={{ events, organizations, activeProfile, setEvents, setOrganizations, setActiveProfile, clearAll }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used within SessionProvider")
  return ctx
}

import { createContext, useContext, useState } from "react"
import type { ClientProfile, Event, Organization } from "@/types"
import { mockClientProfile } from "@/data/mockEvents"

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
  const [activeProfile, setActiveProfile] = useState<ClientProfile>(mockClientProfile)

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

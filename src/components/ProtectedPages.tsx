import { useSession } from "@/contexts/SessionContext"
import { UploadPage } from "@/pages/UploadPage"
import { ClientProfilePage } from "@/pages/ClientProfilePage"
import { RecommendationsPage } from "@/pages/RecommendationsPage"
import { SubmittedProfilesPage } from "@/pages/SubmittedProfilesPage"
import { OrganizationsPage } from "@/pages/OrganizationsPage"

function Upload() {
  const { setEvents, setOrganizations } = useSession()
  return <UploadPage onEventsChange={setEvents} onOrganizationsChange={setOrganizations} />
}

function Profile() {
  const { activeProfile, setActiveProfile } = useSession()
  return <ClientProfilePage initialProfile={activeProfile} onProfileChange={setActiveProfile} />
}

function Recommendations() {
  const { activeProfile, events, organizations } = useSession()
  return <RecommendationsPage profile={activeProfile} events={events} organizations={organizations} />
}

function Submissions() {
  const { setActiveProfile } = useSession()
  const handleLoadProfile = (profile: import("@/types").ClientProfile, profileId?: string) => {
    setActiveProfile(profile, profileId ?? null)
  }
  return <SubmittedProfilesPage onLoadProfile={handleLoadProfile} />
}

function Organizations() {
  return <OrganizationsPage />
}

export const ProtectedPages = {
  Upload,
  Profile,
  Recommendations,
  Submissions,
  Organizations,
}

import { useSession } from "@/contexts/SessionContext"
import { UploadPage } from "@/pages/UploadPage"
import { ClientProfilePage } from "@/pages/ClientProfilePage"
import { RecommendationsPage } from "@/pages/RecommendationsPage"
import { SubmittedProfilesPage } from "@/pages/SubmittedProfilesPage"
import { OrganizationsPage } from "@/pages/OrganizationsPage"
import { ErrorBoundary } from "@/components/ErrorBoundary"

function Upload() {
  const { setEvents, setOrganizations } = useSession()
  return (
    <ErrorBoundary pageName="CSV Upload">
      <UploadPage onEventsChange={setEvents} onOrganizationsChange={setOrganizations} />
    </ErrorBoundary>
  )
}

function Profile() {
  const { activeProfile, setActiveProfile } = useSession()
  return (
    <ErrorBoundary pageName="Client Profile">
      <ClientProfilePage initialProfile={activeProfile} onProfileChange={setActiveProfile} />
    </ErrorBoundary>
  )
}

function Recommendations() {
  const { activeProfile, events, organizations } = useSession()
  return (
    <ErrorBoundary pageName="Recommendations">
      <RecommendationsPage profile={activeProfile} events={events} organizations={organizations} />
    </ErrorBoundary>
  )
}

function Submissions() {
  const { setActiveProfile } = useSession()
  const handleLoadProfile = (profile: import("@/types").ClientProfile, profileId?: string) => {
    setActiveProfile(profile, profileId ?? null)
  }
  return (
    <ErrorBoundary pageName="Submitted Profiles">
      <SubmittedProfilesPage onLoadProfile={handleLoadProfile} />
    </ErrorBoundary>
  )
}

function Organizations() {
  return (
    <ErrorBoundary pageName="Organizations">
      <OrganizationsPage />
    </ErrorBoundary>
  )
}

export const ProtectedPages = {
  Upload,
  Profile,
  Recommendations,
  Submissions,
  Organizations,
}

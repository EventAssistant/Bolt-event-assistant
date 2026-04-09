import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { SessionProvider, useSession } from "@/contexts/SessionContext"
import { EmailSettingsProvider } from "@/contexts/EmailSettingsContext"
import { NavBar } from "@/components/NavBar"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { UploadPage } from "@/pages/UploadPage"
import { ClientProfilePage } from "@/pages/ClientProfilePage"
import { RecommendationsPage } from "@/pages/RecommendationsPage"
import { ClientIntakePage } from "@/pages/ClientIntakePage"
import { SubmittedProfilesPage } from "@/pages/SubmittedProfilesPage"
import { AuditPage } from "@/pages/AuditPage"
import { LoginPage } from "@/pages/LoginPage"
import { SignupPage } from "@/pages/SignupPage"

function ProtectedLayout() {
  const { events, organizations, activeProfile, setEvents, setOrganizations, setActiveProfile } = useSession()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <NavBar />
        <main>
          <Routes>
            <Route
              path="/upload"
              element={
                <UploadPage
                  onEventsChange={setEvents}
                  onOrganizationsChange={setOrganizations}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <ClientProfilePage
                  initialProfile={activeProfile}
                  onProfileChange={setActiveProfile}
                />
              }
            />
            <Route
              path="/recommendations"
              element={
                <RecommendationsPage
                  profile={activeProfile}
                  events={events}
                  organizations={organizations}
                />
              }
            />
            <Route
              path="/submissions"
              element={<SubmittedProfilesPage onLoadProfile={setActiveProfile} />}
            />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="*" element={<Navigate to="/upload" replace />} />
          </Routes>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <EmailSettingsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/client-intake" element={<ClientIntakePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </BrowserRouter>
        </EmailSettingsProvider>
      </SessionProvider>
    </AuthProvider>
  )
}

export default App

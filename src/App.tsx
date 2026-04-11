import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import { SessionProvider } from "@/contexts/SessionContext"
import { EmailSettingsProvider } from "@/contexts/EmailSettingsContext"
import { NavBar } from "@/components/NavBar"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ClientIntakePage } from "@/pages/ClientIntakePage"
import { AuditPage } from "@/pages/AuditPage"
import { LoginPage } from "@/pages/LoginPage"
import { SignupPage } from "@/pages/SignupPage"
import { ProtectedPages } from "@/components/ProtectedPages"

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <NavBar />
        <main>
          <Outlet />
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
          <Toaster position="bottom-right" richColors closeButton />
          <BrowserRouter>
            <Routes>
              <Route path="/client-intake" element={<ClientIntakePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route element={<ProtectedLayout />}>
                <Route path="/upload" element={<ProtectedPages.Upload />} />
                <Route path="/profile" element={<ProtectedPages.Profile />} />
                <Route path="/recommendations" element={<ProtectedPages.Recommendations />} />
                <Route path="/submissions" element={<ProtectedPages.Submissions />} />
                <Route path="/organizations" element={<ProtectedPages.Organizations />} />
                <Route path="/audit" element={<AuditPage />} />
                <Route path="*" element={<Navigate to="/upload" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </EmailSettingsProvider>
      </SessionProvider>
    </AuthProvider>
  )
}

export default App

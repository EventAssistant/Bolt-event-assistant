import { useRef } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Spinner } from "@/components/ui/spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const wasAuthenticatedRef = useRef(false)

  if (user) {
    wasAuthenticatedRef.current = true
  }

  if (loading && !wasAuthenticatedRef.current) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!user && !wasAuthenticatedRef.current) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

import { createContext, useContext, useEffect, useRef, useState, useMemo } from "react"
import type { ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") {
        return
      }

      const newUser = session?.user ?? null

      if (!initializedRef.current) {
        initializedRef.current = true
        setUser(newUser)
        setLoading(false)
        return
      }

      if (event === "SIGNED_OUT") {
        setUser(null)
        return
      }

      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setUser((prev) => {
          if (prev?.id === newUser?.id) return prev
          return newUser
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = useMemo(
    () => ({ user, loading, signUp, signIn, signOut }),
    [user, loading]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

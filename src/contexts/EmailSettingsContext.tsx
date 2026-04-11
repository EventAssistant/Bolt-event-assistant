import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export interface EmailSettings {
  publicKey: string
  serviceId: string
  templateId: string
  senderName: string
}

const defaultSettings: EmailSettings = {
  publicKey: "",
  serviceId: "",
  templateId: "",
  senderName: "",
}

interface EmailSettingsContextType {
  settings: EmailSettings
  updateSettings: (settings: EmailSettings) => Promise<void>
  isConfigured: boolean
  loading: boolean
}

const EmailSettingsContext = createContext<EmailSettingsContextType | null>(null)

export function EmailSettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<EmailSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSettings(defaultSettings)
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from("user_settings")
      .select("emailjs_public_key, emailjs_service_id, emailjs_template_id, emailjs_sender_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSettings({
            publicKey: data.emailjs_public_key,
            serviceId: data.emailjs_service_id,
            templateId: data.emailjs_template_id,
            senderName: data.emailjs_sender_name,
          })
        }
        setLoading(false)
      })
  }, [user])

  const updateSettings = useCallback(async (updated: EmailSettings) => {
    setSettings(updated)
    if (!user) return

    await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        emailjs_public_key: updated.publicKey,
        emailjs_service_id: updated.serviceId,
        emailjs_template_id: updated.templateId,
        emailjs_sender_name: updated.senderName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
  }, [user])

  const isConfigured = Boolean(
    settings.publicKey.trim() && settings.serviceId.trim() && settings.templateId.trim()
  )

  return (
    <EmailSettingsContext.Provider value={{ settings, updateSettings, isConfigured, loading }}>
      {children}
    </EmailSettingsContext.Provider>
  )
}

export function useEmailSettings() {
  const ctx = useContext(EmailSettingsContext)
  if (!ctx) throw new Error("useEmailSettings must be used within EmailSettingsProvider")
  return ctx
}

import { createContext, useContext, useState } from "react"

const STORAGE_KEY = "emailjs_settings"

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

function loadFromStorage(): EmailSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {}
  return defaultSettings
}

interface EmailSettingsContextType {
  settings: EmailSettings
  updateSettings: (settings: EmailSettings) => void
  isConfigured: boolean
}

const EmailSettingsContext = createContext<EmailSettingsContextType | null>(null)

export function EmailSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<EmailSettings>(loadFromStorage)

  const updateSettings = (updated: EmailSettings) => {
    setSettings(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }

  const isConfigured = Boolean(
    settings.publicKey.trim() && settings.serviceId.trim() && settings.templateId.trim()
  )

  return (
    <EmailSettingsContext.Provider value={{ settings, updateSettings, isConfigured }}>
      {children}
    </EmailSettingsContext.Provider>
  )
}

export function useEmailSettings() {
  const ctx = useContext(EmailSettingsContext)
  if (!ctx) throw new Error("useEmailSettings must be used within EmailSettingsProvider")
  return ctx
}

import { useState } from "react"
import emailjs from "emailjs-com"
import { Mail, Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEmailSettings } from "@/contexts/EmailSettingsContext"
import type { ClientProfile } from "@/types"

interface EmailReportButtonProps {
  profile: ClientProfile
  reportHTML: string
  onOpenSettings: () => void
  onSent?: () => void
}

type SendState = "idle" | "sending" | "success" | "error"

export function EmailReportButton({ profile, reportHTML, onOpenSettings, onSent }: EmailReportButtonProps) {
  const { settings, isConfigured } = useEmailSettings()
  const [sendState, setSendState] = useState<SendState>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const clientEmail = profile.email.trim()
  const clientName = profile.name.trim()

  const handleSend = async () => {
    if (!isConfigured || !clientEmail) return

    setSendState("sending")
    setErrorMessage("")

    try {
      emailjs.init(settings.publicKey)

      await emailjs.send(settings.serviceId, settings.templateId, {
        to_email: clientEmail,
        client_name: clientName || "Client",
        report_content: reportHTML,
        sender_name: settings.senderName || "Your Advisor",
        subject: `Your Networking Recommendations Report — ${clientName || "Client"}`,
      })

      setSendState("success")
      onSent?.()
      setTimeout(() => setSendState("idle"), 5000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send email"
      setErrorMessage(message)
      setSendState("error")
    }
  }

  const handleRetry = () => {
    setSendState("idle")
    setErrorMessage("")
  }

  if (!isConfigured) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={onOpenSettings}
        >
          <Settings className="h-3.5 w-3.5" />
          Configure Email
        </Button>
        <span className="text-xs text-muted-foreground">Set up EmailJS to send reports</span>
      </div>
    )
  }

  if (!clientEmail) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-muted-foreground cursor-not-allowed opacity-60"
          disabled
        >
          <Mail className="h-3.5 w-3.5" />
          Email Report
        </Button>
        <span className="text-xs text-muted-foreground">
          Add client email in{" "}
          <a href="/profile" className="text-primary hover:underline">
            Client Profile
          </a>{" "}
          to enable sending
        </span>
      </div>
    )
  }

  if (sendState === "success") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-md border border-chart-4/30 bg-chart-4/10 px-3 py-1.5">
          <CheckCircle2 className="h-4 w-4 text-chart-4 shrink-0" />
          <span className="text-sm font-medium text-chart-4">Report sent to {clientEmail}</span>
        </div>
      </div>
    )
  }

  if (sendState === "error") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-sm text-destructive">
            Failed to send: {errorMessage || "Unknown error"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRetry} className="gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Try Again
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="gap-1.5 text-muted-foreground text-xs"
          >
            <Settings className="h-3.5 w-3.5" />
            Check Settings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleSend}
        disabled={sendState === "sending"}
      >
        {sendState === "sending" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Mail className="h-3.5 w-3.5" />
        )}
        {sendState === "sending" ? "Sending..." : "Email Report to Client"}
      </Button>
      <span className="text-xs text-muted-foreground">
        Send to: <span className="font-medium text-foreground">{clientEmail}</span>
      </span>
    </div>
  )
}

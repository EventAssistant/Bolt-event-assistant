import { useState } from "react"
import emailjs from "emailjs-com"
import { Loader as Loader2, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEmailSettings } from "@/contexts/EmailSettingsContext"
import { supabase, type SubmittedProfileRow } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"

interface SendReviewButtonProps {
  profile: SubmittedProfileRow
  onReviewSent: (profileId: string, sentAt: string) => void
}

function buildReviewEmailBody(profile: SubmittedProfileRow, senderName: string): string {
  const firstName = profile.name.split(" ")[0] || profile.name

  const targetRoles = profile.target_roles.length > 0
    ? profile.target_roles.join(", ")
    : "Not specified"

  const targetIndustries = profile.target_industries.length > 0
    ? profile.target_industries.join(", ")
    : "Not specified"

  const companySize = profile.company_sizes.length > 0
    ? profile.company_sizes.join(", ")
    : "Not specified"

  const location = profile.geographic_area || "Not specified"

  const networkingGoal = profile.target_prospect_description || "Not specified"

  const sender = senderName || "Your Advisor"

  return `Hi ${firstName},

I wanted to do a quick check-in on your networking profile to make sure I'm matching you with the most relevant events and organizations.

Here's what I currently have on file for you:

Target Roles: ${targetRoles}
Target Industries: ${targetIndustries}
Company Size Preference: ${companySize}
Location Focus: ${location}
Networking Goal: ${networkingGoal}

If any of this has changed or you'd like to update anything, just reply to this email and let me know what to change. I'll update your profile right away.

${sender}`
}

export function SendReviewButton({ profile, onReviewSent }: SendReviewButtonProps) {
  const { settings, isConfigured } = useEmailSettings()
  const [sending, setSending] = useState(false)

  const clientEmail = (profile.email ?? "").trim()

  const reviewSentDate = profile.last_review_sent_at
    ? format(new Date(profile.last_review_sent_at), "MMM d, yyyy")
    : null

  const handleSend = async () => {
    if (!isConfigured || !clientEmail || sending) return

    setSending(true)
    try {
      emailjs.init(settings.publicKey)

      const body = buildReviewEmailBody(profile, settings.senderName)

      await emailjs.send(settings.serviceId, settings.templateId, {
        to_email: clientEmail,
        client_name: profile.name || "Client",
        report_content: body,
        sender_name: settings.senderName || "Your Advisor",
        subject: "Quick check-in — is your networking profile still current?",
      })

      const sentAt = new Date().toISOString()

      await supabase
        .from("submitted_profiles")
        .update({ last_review_sent_at: sentAt })
        .eq("id", profile.id)

      onReviewSent(profile.id, sentAt)
      toast.success(`Profile review email sent to ${clientEmail}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send email"
      toast.error(`Failed to send review email: ${message}`)
    } finally {
      setSending(false)
    }
  }

  const disabled = !isConfigured || !clientEmail || sending

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSend}
        disabled={disabled}
        className="gap-1.5 shrink-0 text-muted-foreground hover:text-foreground"
      >
        {sending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ClipboardCheck className="h-3.5 w-3.5" />
        )}
        {sending ? "Sending..." : "Send Review Request"}
      </Button>
      {reviewSentDate && (
        <p className="text-[11px] text-muted-foreground pl-0.5">
          Review sent: {reviewSentDate}
        </p>
      )}
    </div>
  )
}

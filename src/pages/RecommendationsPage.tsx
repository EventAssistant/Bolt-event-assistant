import { useState } from "react"
import {
  Sparkles,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Users,
  ExternalLink,
  CircleCheck as CheckCircle2,
  Star,
  TrendingUp,
  RefreshCw,
  ChevronRight,
  Loader as Loader2,
  Building2,
  Activity,
  Download,
  Mail,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ClientProfile, Event, Organization } from "@/types"
import { AddToCalendarButton } from "@/components/AddToCalendarButton"
import { buildGoogleCalendarUrl } from "@/utils/calendarUtils"
import { EmailReportButton } from "@/components/EmailReportButton"
import { EmailSettingsModal } from "@/components/EmailSettingsModal"

interface AIRecommendation {
  event_name: string
  why_this_event: string
  who_youll_meet: string
  what_to_do: string[]
  priority_rank: number
  matched_event?: Event
}

interface OrgRecommendation {
  org_name: string
  category: string
  home_page: string
  calendar_link: string
  why_join: string
  who_youll_meet: string
  how_to_engage: string[]
  activity_level: string
  priority_rank: number
}

function RankBadge({ rank }: { rank: number }) {
  const label = rank === 1 ? "Top Pick" : rank === 2 ? "2nd Choice" : rank === 3 ? "3rd Choice" : `#${rank}`
  const cls =
    rank === 1
      ? "bg-primary text-primary-foreground"
      : rank === 2
      ? "bg-muted text-foreground"
      : "bg-muted/60 text-muted-foreground"
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
  )
}

function PriorityRing({ rank }: { rank: number }) {
  const color =
    rank === 1 ? "text-chart-4 border-chart-4/40 bg-chart-4/10" :
    rank === 2 ? "text-primary border-primary/40 bg-primary/10" :
    "text-chart-2 border-chart-2/40 bg-chart-2/10"
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${color}`}>
        <span className="text-xl font-bold tabular-nums">#{rank}</span>
      </div>
      <span className="text-xs text-muted-foreground">priority</span>
    </div>
  )
}

function getActivityColor(activity: string): string {
  const lower = (activity ?? "").toLowerCase()
  if (lower.includes("weekly")) return "bg-chart-4/15 text-chart-4"
  if (lower.includes("monthly")) return "bg-primary/10 text-primary"
  if (lower.includes("quarterly")) return "bg-chart-2/15 text-chart-2"
  if (lower.includes("annual") || lower.includes("yearly")) return "bg-chart-3/15 text-chart-3"
  return "bg-muted text-muted-foreground"
}

function AIRecommendationCard({ rec }: { rec: AIRecommendation }) {
  const { event_name, why_this_event, who_youll_meet, what_to_do, priority_rank, matched_event } = rec

  return (
    <Card
      className={`border-border transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
        priority_rank === 1 ? "border-primary/20 ring-1 ring-primary/10" : ""
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <PriorityRing rank={priority_rank} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <RankBadge rank={priority_rank} />
              {matched_event && (
                <Badge variant="secondary" className="text-xs">
                  {matched_event.event_type}
                </Badge>
              )}
              {priority_rank === 1 && (
                <Badge className="text-xs bg-primary/15 text-primary border-primary/20 gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Recommended
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-snug">
              {matched_event?.website ? (
                <a
                  href={matched_event.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-primary transition-colors"
                >
                  {event_name}
                </a>
              ) : (
                event_name
              )}
            </CardTitle>
            {matched_event && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {matched_event.start_date
                    ? new Date(matched_event.start_date + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {matched_event.start_time || "—"}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {matched_event.event_city || "—"}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 shrink-0" />
                  {matched_event.paid || "—"}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Why This Event
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{why_this_event}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Who You'll Meet
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{who_youll_meet}</p>
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What To Do
            </p>
          </div>
          <ul className="space-y-2">
            {what_to_do.map((action, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {matched_event && (
          <div className="flex items-center gap-3 flex-wrap">
            {matched_event.website && (
              <Button asChild size="sm" className="gap-1.5">
                <a href={matched_event.website} target="_blank" rel="noopener noreferrer">
                  View Event
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            <AddToCalendarButton event={matched_event} size="sm" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function OrgRecommendationCard({ rec }: { rec: OrgRecommendation }) {
  const { org_name, category, home_page, calendar_link, why_join, who_youll_meet, how_to_engage, activity_level, priority_rank } = rec

  return (
    <Card
      className={`border-border transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
        priority_rank === 1 ? "border-primary/20 ring-1 ring-primary/10" : ""
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <PriorityRing rank={priority_rank} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <RankBadge rank={priority_rank} />
              {category && (
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
              )}
              {activity_level && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getActivityColor(activity_level)}`}>
                  <Activity className="h-3 w-3 mr-1" />
                  {activity_level}
                </span>
              )}
              {priority_rank === 1 && (
                <Badge className="text-xs bg-primary/15 text-primary border-primary/20 gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Top Org
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-snug">
              {home_page ? (
                <a
                  href={home_page}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-primary transition-colors"
                >
                  {org_name}
                </a>
              ) : (
                org_name
              )}
            </CardTitle>
            {(home_page || calendar_link) && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {home_page && (
                  <a
                    href={home_page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    Website
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                {calendar_link && (
                  <a
                    href={calendar_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary hover:underline"
                  >
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    Events Calendar
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Why Join
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{why_join}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Who You'll Meet
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{who_youll_meet}</p>
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              How To Get Involved
            </p>
          </div>
          <ul className="space-y-2">
            {(how_to_engage ?? []).map((action, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function generateReportHTML(
  profile: ClientProfile,
  recommendations: AIRecommendation[],
  orgRecommendations: OrgRecommendation[]
): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const eventHTML = recommendations
    .map((rec) => {
      const ev = rec.matched_event
      const eventUrl = ev?.website
      const eventNameDisplay = eventUrl
        ? `<a href="${eventUrl}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: underline;">${rec.event_name}</a>`
        : rec.event_name
      const dateStr = ev?.start_date
        ? new Date(ev.start_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
        : null
      const metaParts = [
        dateStr,
        ev?.start_time,
        ev?.event_city,
        ev?.paid ? `Cost: ${ev.paid}` : null,
      ].filter(Boolean)
      const googleUrl = ev ? buildGoogleCalendarUrl(ev) : ""
      const eventButtons = [
        eventUrl ? `<a href="${eventUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.3rem 0.75rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.8rem; color: #374151; text-decoration: none;">🌐 View Event</a>` : "",
        googleUrl ? `<a href="${googleUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.3rem 0.75rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.8rem; color: #374151; text-decoration: none;">📅 Google Calendar</a>` : "",
      ].filter(Boolean).join(" ")
      return `
    <div style="margin-bottom: 2rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;">
      <div style="margin-bottom: 0.5rem;">
        <strong style="font-size: 1.125rem;">#${rec.priority_rank} — ${eventNameDisplay}</strong>
      </div>
      ${metaParts.length > 0 ? `<p style="color: #888; font-size: 0.875rem; margin: 0.25rem 0 0.75rem;">${metaParts.join(" · ")}</p>` : ""}
      ${eventButtons ? `<div style="margin: 0.5rem 0 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">${eventButtons}</div>` : ""}
      <p style="color: #666; margin: 0.75rem 0 0.5rem;"><strong>Why:</strong> ${rec.why_this_event}</p>
      <p style="color: #666; margin: 0.5rem 0;"><strong>Who:</strong> ${rec.who_youll_meet}</p>
      <div style="margin: 0.5rem 0;">
        <strong>What to do:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
          ${rec.what_to_do.map((action) => `<li>${action}</li>`).join("")}
        </ul>
      </div>
    </div>
  `
    })
    .join("")

  const orgHTML = orgRecommendations
    .map((rec) => {
      const orgUrl = rec.home_page
      const orgNameDisplay = orgUrl
        ? `<a href="${orgUrl}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: underline;">${rec.org_name}</a>`
        : rec.org_name
      const calendarUrl = rec.calendar_link
      const orgLinks = [
        orgUrl ? `<a href="${orgUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.3rem 0.75rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.8rem; color: #374151; text-decoration: none;">🌐 Website</a>` : "",
        calendarUrl ? `<a href="${calendarUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.3rem 0.75rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.8rem; color: #374151; text-decoration: none;">📅 Events Calendar</a>` : "",
      ].filter(Boolean).join(" ")
      return `
    <div style="margin-bottom: 2rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;">
      <div style="margin-bottom: 0.5rem;">
        <strong style="font-size: 1.125rem;">#${rec.priority_rank} — ${orgNameDisplay}</strong>
      </div>
      ${orgLinks ? `<div style="margin: 0.5rem 0 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">${orgLinks}</div>` : ""}
      <p style="color: #666; margin: 0.5rem 0;"><strong>Category:</strong> ${rec.category}</p>
      <p style="color: #666; margin: 0.5rem 0;"><strong>Activity:</strong> ${rec.activity_level}</p>
      <p style="color: #666; margin: 0.5rem 0;"><strong>Why:</strong> ${rec.why_join}</p>
      <p style="color: #666; margin: 0.5rem 0;"><strong>Who:</strong> ${rec.who_youll_meet}</p>
      <div style="margin: 0.5rem 0;">
        <strong>How to engage:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
          ${rec.how_to_engage.map((action) => `<li>${action}</li>`).join("")}
        </ul>
      </div>
    </div>
  `
    })
    .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Networking Recommendations Report</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 2rem; }
        h1 { color: #000; margin-bottom: 0.5rem; }
        h2 { color: #333; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #000; padding-bottom: 0.5rem; }
        .header { margin-bottom: 2rem; }
        .client-info { background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .client-info p { margin: 0.25rem 0; }
        .date { color: #666; font-size: 0.875rem; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Networking Recommendations Report</h1>
        <p class="date">${today}</p>
      </div>

      <div class="client-info">
        <h3>Client Profile</h3>
        <p><strong>Name:</strong> ${profile.name}</p>
        <p><strong>Title:</strong> ${profile.title}</p>
        <p><strong>Industry:</strong> ${profile.industry}</p>
        <p><strong>Target Industries:</strong> ${profile.targetIndustries.join(", ") || "—"}</p>
        <p><strong>Target Roles:</strong> ${profile.targetRoles.join(", ") || "—"}</p>
      </div>

      ${recommendations.length > 0 ? `<h2>Recommended Events (${recommendations.length})</h2>${eventHTML}` : ""}
      ${orgRecommendations.length > 0 ? `<h2>Recommended Organizations (${orgRecommendations.length})</h2>${orgHTML}` : ""}

      <p style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; color: #999; font-size: 0.875rem;">Generated by AI Matching Engine</p>
    </body>
    </html>
  `
}

function ClientContextCard({ profile }: { profile: ClientProfile }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Client Context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Client</p>
          <p className="text-sm font-medium text-foreground mt-0.5">{profile.name}</p>
          <p className="text-xs text-muted-foreground">{profile.title} · {profile.industry}</p>
          {profile.email && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Mail className="h-3 w-3 shrink-0" />
              {profile.email}
            </p>
          )}
        </div>
        {profile.targetRoles.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Target Roles</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.targetRoles.map((r) => (
                  <Badge key={r} className="text-xs bg-primary/15 text-primary border-primary/20">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
        {profile.targetIndustries.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Target Industries</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.targetIndustries.map((i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {i}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
        {profile.companySizes.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Company Size</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.companySizes.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
        {(profile.painPoint1 || profile.painPoint2 || profile.painPoint3) && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Pain Points</p>
              <ul className="space-y-1.5">
                {[profile.painPoint1, profile.painPoint2, profile.painPoint3]
                  .filter(Boolean)
                  .map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                      <span className="text-xs text-muted-foreground leading-relaxed">{p}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </>
        )}
        {profile.decisionDrivers.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Decision Drivers</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.decisionDrivers.map((d) => (
                  <Badge key={d} className="text-xs bg-chart-2/10 text-chart-2 border-chart-2/25">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function RecommendationsPage({
  profile,
  events,
  organizations,
}: {
  profile: ClientProfile
  events: Event[]
  organizations: Organization[]
}) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [orgRecommendations, setOrgRecommendations] = useState<OrgRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasRun, setHasRun] = useState(false)
  const [emailSettingsOpen, setEmailSettingsOpen] = useState(false)

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const handleExportReport = () => {
    const html = generateReportHTML(profile, recommendations, orgRecommendations)
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `recommendations_${profile.name || "report"}_${new Date().toISOString().split("T")[0]}.html`)
    link.click()
  }

  const handleGenerateRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const profilePayload = {
        name: profile.name,
        title: profile.title,
        industry: profile.industry,
        target_prospect_description: profile.targetProspectDescription,
        target_industries: profile.targetIndustries,
        target_roles: profile.targetRoles,
        company_sizes: profile.companySizes,
        revenue_ranges: profile.revenueRanges,
        professional_associations: profile.professionalAssociations,
        pain_points: [profile.painPoint1, profile.painPoint2, profile.painPoint3].filter(Boolean),
        decision_drivers: profile.decisionDrivers,
        success_metrics: [profile.successMetric1, profile.successMetric2, profile.successMetric3].filter(Boolean),
      }

      const eventsPayload = events.map((e) => ({
        id: e.id,
        name: e.name,
        start_date: e.start_date,
        start_time: e.start_time,
        address: e.address,
        event_type: e.event_type,
        group_type: e.group_type,
        paid: e.paid,
        description: e.description,
        website: e.website,
      }))

      const orgsPayload = organizations.map((o) => ({
        name: o.name,
        category: o.category,
        city: o.city,
        description: o.description,
        home_page: o.home_page,
        calendar_link: o.calendar,
        internal_type: o.internal_type,
        notes: o.notes,
      }))

      const response = await fetch(`${supabaseUrl}/functions/v1/match-events`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: profilePayload,
          events: eventsPayload,
          organizations: orgsPayload,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || `Request failed: ${response.status}`)
      }

      const data = await response.json()

      const recs: AIRecommendation[] = data.recommendations ?? []
      const enriched = recs.map((rec) => ({
        ...rec,
        matched_event: events.find(
          (e) => e.name.toLowerCase() === rec.event_name.toLowerCase()
        ),
      }))
      enriched.sort((a, b) => a.priority_rank - b.priority_rank)
      setRecommendations(enriched)

      const orgRecs: OrgRecommendation[] = data.org_recommendations ?? []
      orgRecs.sort((a, b) => a.priority_rank - b.priority_rank)
      setOrgRecommendations(orgRecs)

      setHasRun(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Event Recommendations</h1>
          <p className="mt-1.5 text-muted-foreground">
            AI-matched events for{" "}
            <span className="font-medium text-foreground">{profile.name || "your client"}</span> based on their
            networking profile.
          </p>
        </div>
        {hasRun && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportReport}
              disabled={loading || (recommendations.length === 0 && orgRecommendations.length === 0)}
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleGenerateRecommendations}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Re-run Matching
            </Button>
          </div>
        )}
        <EmailSettingsModal open={emailSettingsOpen} onOpenChange={setEmailSettingsOpen} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {!hasRun && !loading && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-8 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Ready to Match</h2>
              <p className="text-sm text-muted-foreground max-w-sm mb-2">
                Click below to send your client's persona profile and {events.length} uploaded events to the AI matching engine.
              </p>
              {organizations.length > 0 && (
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Also matching against{" "}
                  <span className="font-medium text-foreground">{organizations.length} organizations</span> for ongoing networking recommendations.
                </p>
              )}
              <Button
                size="lg"
                className="gap-2 mt-2"
                onClick={handleGenerateRecommendations}
                disabled={loading || events.length === 0}
              >
                <Sparkles className="h-4 w-4" />
                Generate Recommendations
                <ChevronRight className="h-4 w-4" />
              </Button>
              {events.length === 0 && (
                <p className="mt-3 text-xs text-destructive">Upload a CSV file first to load events.</p>
              )}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 px-8 py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm font-medium text-foreground">
                Analyzing {events.length} events
                {organizations.length > 0 ? ` and ${organizations.length} organizations` : ""}...
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                Claude is matching to your client's persona profile
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4">
              <p className="text-sm font-medium text-destructive mb-1">Matching failed</p>
              <p className="text-xs text-destructive/80">{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={handleGenerateRecommendations}
              >
                Try Again
              </Button>
            </div>
          )}

          {!loading && hasRun && recommendations.length > 0 && (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <Sparkles className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Matched {recommendations.length} events from {events.length} reviewed
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ranked by persona alignment, audience quality, and networking format suitability
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {recommendations.map((rec) => (
                  <AIRecommendationCard key={`${rec.event_name}-${rec.priority_rank}`} rec={rec} />
                ))}
              </div>
            </>
          )}

          {!loading && hasRun && orgRecommendations.length > 0 && (
            <div className="space-y-5 pt-4">
              <div className="flex items-center gap-3 rounded-xl border border-chart-2/20 bg-chart-2/5 px-4 py-3">
                <Building2 className="h-5 w-5 shrink-0 text-chart-2" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {orgRecommendations.length} organizations recommended for ongoing networking
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Communities where your client will consistently meet their ideal prospects
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {orgRecommendations.map((rec) => (
                  <OrgRecommendationCard key={`${rec.org_name}-${rec.priority_rank}`} rec={rec} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {hasRun && (recommendations.length > 0 || orgRecommendations.length > 0) && (
            <Card className="border-border bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Email Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <EmailReportButton
                  profile={profile}
                  reportHTML={generateReportHTML(profile, recommendations, orgRecommendations)}
                  onOpenSettings={() => setEmailSettingsOpen(true)}
                />
              </CardContent>
            </Card>
          )}

          {hasRun && (recommendations.length > 0 || orgRecommendations.length > 0) && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Match Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.length > 0 && (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Events</p>
                    {recommendations.map((rec, index) => (
                      <div key={`${rec.event_name}-summary`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold ${
                                index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {rec.priority_rank}
                            </span>
                            <span className="text-sm text-foreground truncate">{rec.event_name}</span>
                          </div>
                        </div>
                        {index < recommendations.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </>
                )}

                {orgRecommendations.length > 0 && (
                  <>
                    {recommendations.length > 0 && <Separator />}
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organizations</p>
                    {orgRecommendations.map((rec, index) => (
                      <div key={`${rec.org_name}-org-summary`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold ${
                                index === 0 ? "bg-chart-2 text-white" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {rec.priority_rank}
                            </span>
                            <span className="text-sm text-foreground truncate">{rec.org_name}</span>
                          </div>
                        </div>
                        {index < orgRecommendations.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <ClientContextCard profile={profile} />

          <Card className="border-border bg-muted/20">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs font-semibold text-foreground mb-2">About AI Matching</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Recommendations are generated by Claude using your client's full persona profile — including target roles, industries, pain points, and decision drivers — matched against the uploaded event list.
              </p>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Events are ranked 1–5 by how likely your client is to encounter their ideal prospect there.
              </p>
              {organizations.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  Organization recommendations identify ongoing communities where ideal prospects show up consistently, prioritizing active and current groups.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

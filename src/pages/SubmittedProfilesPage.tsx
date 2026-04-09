import { useEffect, useState } from "react"
import {
  Users,
  Calendar,
  ChevronRight,
  RefreshCw,
  Building2,
  Briefcase,
  MapPin,
  Inbox,
  CircleCheck as CheckCircle2,
  Link,
  Copy,
  Check,
  Pencil,
  Mail,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase, type SubmittedProfileRow } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"
import type { ClientProfile } from "@/types"
import { EditProfileModal } from "@/components/EditProfileModal"

function ShareLinkBanner() {
  const [copied, setCopied] = useState(false)
  const intakeUrl = `${window.location.origin}/client-intake`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(intakeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-5 pb-5 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
              <Link className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Client Intake Form</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share this link with clients — no login needed, they just fill in their info
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <code className="hidden sm:inline-flex items-center rounded-md bg-muted border border-border/60 px-3 py-1.5 text-xs font-mono text-muted-foreground max-w-[220px] truncate">
              {intakeUrl}
            </code>
            <Button
              size="sm"
              variant={copied ? "default" : "outline"}
              onClick={handleCopy}
              className="gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function toClientProfile(row: SubmittedProfileRow): ClientProfile {
  return {
    name: row.name,
    email: row.email,
    industry: row.industry,
    title: row.title,
    city: "",
    networkingGoal: "",
    aiNotes: "",
    targetProspectDescription: row.target_prospect_description,
    targetIndustries: row.target_industries,
    targetRoles: row.target_roles,
    companySizes: row.company_sizes,
    revenueRanges: row.revenue_ranges,
    professionalAssociations: row.professional_associations,
    painPoint1: row.pain_point_1,
    painPoint2: row.pain_point_2,
    painPoint3: row.pain_point_3,
    decisionDrivers: row.decision_drivers,
    successMetric1: row.success_metric_1,
    successMetric2: row.success_metric_2,
    successMetric3: row.success_metric_3,
  }
}

function ProfileCard({
  profile,
  onLoad,
  onEdit,
}: {
  profile: SubmittedProfileRow
  onLoad: () => void
  onEdit: () => void
}) {
  const submittedDate = new Date(profile.submitted_at)
  const formattedDate = submittedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const formattedTime = submittedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card className="border-border transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
            <span className="text-sm font-bold text-primary">{initials || "?"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base leading-snug">
                  {profile.name || "Unnamed Submission"}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {[profile.title, profile.industry].filter(Boolean).join(" · ") || "—"}
                </p>
                {profile.email && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Mail className="h-3 w-3 shrink-0" />
                    {profile.email}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
                <span className="hidden sm:inline">· {formattedTime}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {profile.target_roles.length > 0 && (
          <div className="flex items-start gap-2">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
            <div className="flex flex-wrap gap-1.5">
              {profile.target_roles.slice(0, 4).map((r) => (
                <Badge key={r} className="text-xs bg-primary/15 text-primary border-primary/20">
                  {r}
                </Badge>
              ))}
              {profile.target_roles.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{profile.target_roles.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {profile.target_industries.length > 0 && (
          <div className="flex items-start gap-2">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
            <div className="flex flex-wrap gap-1.5">
              {profile.target_industries.slice(0, 4).map((i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {i}
                </Badge>
              ))}
              {profile.target_industries.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{profile.target_industries.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {(profile.company_sizes.length > 0 || profile.revenue_ranges.length > 0 || profile.geographic_area) && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {profile.company_sizes.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {profile.company_sizes.join(", ")}
              </span>
            )}
            {profile.geographic_area && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {profile.geographic_area}
              </span>
            )}
          </div>
        )}

        {profile.target_prospect_description && (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {profile.target_prospect_description}
            </p>
          </>
        )}

        <Separator />

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 shrink-0">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button onClick={onLoad} className="flex-1 gap-2" size="sm">
            <CheckCircle2 className="h-4 w-4" />
            Load into Client Profile
            <ChevronRight className="h-3.5 w-3.5 ml-auto" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-8 w-full rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SubmittedProfilesPage({
  onLoadProfile,
}: {
  onLoadProfile: (profile: ClientProfile) => void
}) {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<SubmittedProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadedId, setLoadedId] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState<SubmittedProfileRow | null>(null)

  const fetchProfiles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("submitted_profiles")
      .select("*")
      .order("submitted_at", { ascending: false })

    if (!error && data) {
      setProfiles(data as SubmittedProfileRow[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const handleLoad = (profile: SubmittedProfileRow) => {
    onLoadProfile(toClientProfile(profile))
    setLoadedId(profile.id)
    setTimeout(() => {
      navigate("/profile")
    }, 600)
  }

  const handleSaveEdit = async (updated: SubmittedProfileRow) => {
    const { error } = await supabase
      .from("submitted_profiles")
      .update({
        name: updated.name,
        email: updated.email,
        title: updated.title,
        industry: updated.industry,
        geographic_area: updated.geographic_area,
        target_prospect_description: updated.target_prospect_description,
        target_roles: updated.target_roles,
        target_industries: updated.target_industries,
        professional_associations: updated.professional_associations,
        company_sizes: updated.company_sizes,
        revenue_ranges: updated.revenue_ranges,
        pain_point_1: updated.pain_point_1,
        pain_point_2: updated.pain_point_2,
        pain_point_3: updated.pain_point_3,
        decision_drivers: updated.decision_drivers,
        success_metric_1: updated.success_metric_1,
        success_metric_2: updated.success_metric_2,
        success_metric_3: updated.success_metric_3,
      })
      .eq("id", updated.id)

    if (!error) {
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    }
    setEditingProfile(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Submitted Profiles</h1>
          <p className="mt-1.5 text-muted-foreground">
            Client intake submissions from the public form. Click any profile to load it for matching.
          </p>
        </div>
        <Button variant="outline" onClick={fetchProfiles} className="gap-2 shrink-0" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <ShareLinkBanner />

      {loading ? (
        <LoadingSkeleton />
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 border border-border">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-medium text-foreground">No submissions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Share the <code className="text-primary">/client-intake</code> link with your clients to collect their profiles.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {profiles.length} submission{profiles.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => (
              <div key={profile.id} className="relative">
                {loadedId === profile.id && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/30">
                    <div className="flex items-center gap-2 text-primary font-medium text-sm">
                      <CheckCircle2 className="h-5 w-5" />
                      Loaded — redirecting...
                    </div>
                  </div>
                )}
                <ProfileCard
                  profile={profile}
                  onLoad={() => handleLoad(profile)}
                  onEdit={() => setEditingProfile(profile)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {editingProfile && (
        <EditProfileModal
          profile={editingProfile}
          open={editingProfile !== null}
          onOpenChange={(val) => { if (!val) setEditingProfile(null) }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

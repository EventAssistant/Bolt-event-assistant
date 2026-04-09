import { useState, useEffect } from "react"
import { CircleUser as UserCircle, Building2, Briefcase, Target, Plus, X, Save, ChevronRight, TrendingUp, TriangleAlert as AlertTriangle, ChartBar as BarChart3, Users as Users2, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router-dom"
import type { ClientProfile } from "@/types"

const COMPANY_SIZE_OPTIONS = ["Solopreneur", "2-10", "11-50", "51-200", "201-500", "500+"]
const REVENUE_RANGE_OPTIONS = ["Under $500K", "$500K-$2M", "$2M-$10M", "$10M-$50M", "$50M+"]

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
  badgeClassName,
}: {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
  placeholder: string
  badgeClassName?: string
}) {
  const [input, setInput] = useState("")

  const handleAdd = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed)
      setInput("")
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[36px]">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className={`gap-1.5 pl-2.5 pr-1.5 py-1 text-xs ${badgeClassName ?? ""}`}
          >
            {tag}
            <button
              onClick={() => onRemove(tag)}
              className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {tags.length === 0 && <span className="text-xs text-muted-foreground/50 pt-2">None added</span>}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={placeholder}
          className="h-8 bg-muted/30 text-sm"
        />
        <Button size="sm" variant="outline" onClick={handleAdd} className="h-8 px-2.5 shrink-0">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

function ChipSelector({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = selected.includes(opt)
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ${
              isActive
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/8 hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

export function ClientProfilePage({
  initialProfile,
  onProfileChange,
}: {
  initialProfile: ClientProfile
  onProfileChange: (profile: ClientProfile) => void
}) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ClientProfile>(initialProfile)
  const [newIndustry, setNewIndustry] = useState("")
  const [newRole, setNewRole] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProfile(initialProfile)
  }, [initialProfile])

  const updateProfile = (updated: ClientProfile) => {
    setProfile(updated)
    onProfileChange(updated)
  }

  const addIndustry = () => {
    if (newIndustry.trim() && !profile.targetIndustries.includes(newIndustry.trim())) {
      updateProfile({ ...profile, targetIndustries: [...profile.targetIndustries, newIndustry.trim()] })
      setNewIndustry("")
    }
  }

  const removeIndustry = (industry: string) => {
    updateProfile({ ...profile, targetIndustries: profile.targetIndustries.filter((i) => i !== industry) })
  }

  const addRole = () => {
    if (newRole.trim() && !profile.targetRoles.includes(newRole.trim())) {
      updateProfile({ ...profile, targetRoles: [...profile.targetRoles, newRole.trim()] })
      setNewRole("")
    }
  }

  const removeRole = (role: string) => {
    updateProfile({ ...profile, targetRoles: profile.targetRoles.filter((r) => r !== role) })
  }

  const toggleCompanySize = (size: string) => {
    const updated = profile.companySizes.includes(size)
      ? profile.companySizes.filter((s) => s !== size)
      : [...profile.companySizes, size]
    updateProfile({ ...profile, companySizes: updated })
  }

  const toggleRevenueRange = (range: string) => {
    const updated = profile.revenueRanges.includes(range)
      ? profile.revenueRanges.filter((r) => r !== range)
      : [...profile.revenueRanges, range]
    updateProfile({ ...profile, revenueRanges: updated })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Client Profile</h1>
          <p className="mt-1.5 text-muted-foreground">
            Define your client's background and ideal prospect to power AI-driven event matching.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            {saved ? "Saved!" : "Save Profile"}
          </Button>
          <Button onClick={() => navigate("/recommendations")} className="gap-2">
            Run Matching
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Client Information</CardTitle>
              </div>
              <CardDescription>Basic details about the client you are advising.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => updateProfile({ ...profile, name: e.target.value })}
                    placeholder="e.g. Sarah Mitchell"
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfile({ ...profile, email: e.target.value })}
                    placeholder="e.g. sarah@example.com"
                    className="bg-muted/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-foreground">
                    Job Title
                  </Label>
                  <Input
                    id="title"
                    value={profile.title}
                    onChange={(e) => updateProfile({ ...profile, title: e.target.value })}
                    placeholder="e.g. Senior Consultant"
                    className="bg-muted/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium text-foreground">
                    Client's Industry
                  </Label>
                  <Input
                    id="industry"
                    value={profile.industry}
                    onChange={(e) => updateProfile({ ...profile, industry: e.target.value })}
                    placeholder="e.g. Management Consulting"
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-foreground">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => updateProfile({ ...profile, city: e.target.value })}
                    placeholder="e.g. Austin, TX"
                    className="bg-muted/30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="networkingGoal" className="text-sm font-medium text-foreground">
                  Networking Goal
                </Label>
                <Input
                  id="networkingGoal"
                  value={profile.networkingGoal}
                  onChange={(e) => updateProfile({ ...profile, networkingGoal: e.target.value })}
                  placeholder="e.g. Find CFOs at mid-market manufacturers to discuss ERP consulting"
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiNotes" className="text-sm font-medium text-foreground">
                  AI Notes
                </Label>
                <Textarea
                  id="aiNotes"
                  value={profile.aiNotes}
                  onChange={(e) => updateProfile({ ...profile, aiNotes: e.target.value })}
                  rows={3}
                  placeholder="Any additional context for the AI matching engine — tone, approach, specific event types to prioritize or avoid..."
                  className="resize-none bg-muted/30 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Ideal Prospect Description</CardTitle>
              </div>
              <CardDescription>
                Describe in detail who this client wants to meet — the more specific, the better the matching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={profile.targetProspectDescription}
                onChange={(e) => updateProfile({ ...profile, targetProspectDescription: e.target.value })}
                rows={5}
                placeholder="Describe the ideal prospect: their role, company size, industry, current challenges, and what type of conversation your client wants to have..."
                className="resize-none bg-muted/30 text-sm leading-relaxed"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {profile.targetProspectDescription.length} characters · Aim for 150–400 characters for best results
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Target Industries</CardTitle>
                </div>
                <CardDescription className="text-xs">Industries where ideal prospects work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {profile.targetIndustries.map((industry) => (
                    <Badge
                      key={industry}
                      variant="secondary"
                      className="gap-1.5 pl-2.5 pr-1.5 py-1 text-xs"
                    >
                      {industry}
                      <button
                        onClick={() => removeIndustry(industry)}
                        className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Input
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addIndustry()}
                    placeholder="Add industry..."
                    className="h-8 bg-muted/30 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={addIndustry} className="h-8 px-2.5 shrink-0">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Target Roles</CardTitle>
                </div>
                <CardDescription className="text-xs">Job titles and roles to connect with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {profile.targetRoles.map((role) => (
                    <Badge
                      key={role}
                      className="gap-1.5 pl-2.5 pr-1.5 py-1 text-xs bg-primary/15 text-primary border-primary/20 hover:bg-primary/20"
                    >
                      {role}
                      <button
                        onClick={() => removeRole(role)}
                        className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Input
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addRole()}
                    placeholder="Add role..."
                    className="h-8 bg-muted/30 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={addRole} className="h-8 px-2.5 shrink-0">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Organizational Context</CardTitle>
              </div>
              <CardDescription>
                Characteristics of the organizations where ideal prospects work.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label className="text-sm font-medium text-foreground">Company Size of Ideal Prospect</Label>
                </div>
                <ChipSelector
                  options={COMPANY_SIZE_OPTIONS}
                  selected={profile.companySizes}
                  onToggle={toggleCompanySize}
                />
                {profile.companySizes.length === 0 && (
                  <p className="text-xs text-muted-foreground/60">Select all that apply</p>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label className="text-sm font-medium text-foreground">Annual Revenue Range</Label>
                </div>
                <ChipSelector
                  options={REVENUE_RANGE_OPTIONS}
                  selected={profile.revenueRanges}
                  onToggle={toggleRevenueRange}
                />
                {profile.revenueRanges.length === 0 && (
                  <p className="text-xs text-muted-foreground/60">Select all that apply</p>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label className="text-sm font-medium text-foreground">Professional Associations</Label>
                </div>
                <p className="text-xs text-muted-foreground -mt-1">
                  Associations, groups, or networks this prospect likely belongs to
                </p>
                <TagInput
                  tags={profile.professionalAssociations}
                  onAdd={(tag) => updateProfile({ ...profile, professionalAssociations: [...profile.professionalAssociations, tag] })}
                  onRemove={(tag) => updateProfile({ ...profile, professionalAssociations: profile.professionalAssociations.filter((a) => a !== tag) })}
                  placeholder="e.g. AICPA, YPO, ACG..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Business Pain Points</CardTitle>
              </div>
              <CardDescription>
                Top challenges this ideal prospect is actively trying to solve right now.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="pain1" className="text-sm font-medium text-foreground">
                  Pain Point 1
                </Label>
                <Input
                  id="pain1"
                  value={profile.painPoint1}
                  onChange={(e) => updateProfile({ ...profile, painPoint1: e.target.value })}
                  placeholder="e.g. Reducing operational costs while maintaining growth"
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pain2" className="text-sm font-medium text-foreground">
                  Pain Point 2
                </Label>
                <Input
                  id="pain2"
                  value={profile.painPoint2}
                  onChange={(e) => updateProfile({ ...profile, painPoint2: e.target.value })}
                  placeholder="e.g. Improving financial reporting accuracy and cycle time"
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pain3" className="text-sm font-medium text-foreground">
                  Pain Point 3
                </Label>
                <Input
                  id="pain3"
                  value={profile.painPoint3}
                  onChange={(e) => updateProfile({ ...profile, painPoint3: e.target.value })}
                  placeholder="e.g. Navigating technology transformation with limited expertise"
                  className="bg-muted/30"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Strategic Insights</CardTitle>
              </div>
              <CardDescription>
                What drives this prospect's decisions and how they measure success.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">What Drives Their Decisions</Label>
                <p className="text-xs text-muted-foreground -mt-1">
                  Key motivators that influence how this prospect makes buying or partnership decisions
                </p>
                <TagInput
                  tags={profile.decisionDrivers}
                  onAdd={(tag) => updateProfile({ ...profile, decisionDrivers: [...profile.decisionDrivers, tag] })}
                  onRemove={(tag) => updateProfile({ ...profile, decisionDrivers: profile.decisionDrivers.filter((d) => d !== tag) })}
                  placeholder="e.g. ROI, peer referrals, risk reduction..."
                  badgeClassName="bg-chart-2/10 text-chart-2 border-chart-2/25"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-sm font-medium text-foreground">How They Measure Success</Label>
                <p className="text-xs text-muted-foreground -mt-2">
                  Specific metrics or outcomes this prospect uses to evaluate whether a solution worked
                </p>
                <div className="space-y-3">
                  <Input
                    value={profile.successMetric1}
                    onChange={(e) => updateProfile({ ...profile, successMetric1: e.target.value })}
                    placeholder="Success metric 1 — e.g. 15% cost reduction within 12 months"
                    className="bg-muted/30"
                  />
                  <Input
                    value={profile.successMetric2}
                    onChange={(e) => updateProfile({ ...profile, successMetric2: e.target.value })}
                    placeholder="Success metric 2 — e.g. Faster month-end close by 30%"
                    className="bg-muted/30"
                  />
                  <Input
                    value={profile.successMetric3}
                    onChange={(e) => updateProfile({ ...profile, successMetric3: e.target.value })}
                    placeholder="Success metric 3 (optional)"
                    className="bg-muted/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Profile Preview</CardTitle>
              <CardDescription>How your client will appear in matching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
                  <span className="text-lg font-bold text-primary">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profile.name || "—"}</p>
                  <p className="text-sm text-muted-foreground">{profile.title || "—"}</p>
                  <p className="text-xs text-muted-foreground">{profile.industry || "—"}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Target Industries
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.targetIndustries.length > 0 ? (
                    profile.targetIndustries.map((i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {i}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None added</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Target Roles
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.targetRoles.length > 0 ? (
                    profile.targetRoles.map((r) => (
                      <Badge key={r} className="text-xs bg-primary/15 text-primary border-primary/20">
                        {r}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None added</span>
                  )}
                </div>
              </div>

              {(profile.companySizes.length > 0 || profile.revenueRanges.length > 0) && (
                <>
                  <Separator />
                  {profile.companySizes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Company Size
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.companySizes.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.revenueRanges.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Revenue Range
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.revenueRanges.map((r) => (
                          <Badge key={r} className="text-xs bg-chart-4/12 text-chart-4 border-chart-4/25">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {profile.professionalAssociations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Associations
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.professionalAssociations.map((a) => (
                        <Badge key={a} variant="secondary" className="text-xs">
                          {a}
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Pain Points
                    </p>
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Decision Drivers
                    </p>
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

              {(profile.successMetric1 || profile.successMetric2 || profile.successMetric3) && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Success Metrics
                    </p>
                    <ul className="space-y-1.5">
                      {[profile.successMetric1, profile.successMetric2, profile.successMetric3]
                        .filter(Boolean)
                        .map((m, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-chart-4/60 shrink-0" />
                            <span className="text-xs text-muted-foreground leading-relaxed">{m}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Prospect Notes
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                  {profile.targetProspectDescription || "No description provided."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border border-primary/20 bg-primary/5">
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm font-semibold text-primary">Ready to match?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                With your client profile complete, generate AI-powered event recommendations tailored to{" "}
                {profile.name || "your client"}'s networking goals and target industries.
              </p>
              <Button
                className="w-full gap-2"
                onClick={() => navigate("/recommendations")}
              >
                Generate Recommendations
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"
import { Plus, X, CircleCheck as CheckCircle2, MapPin, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const COMPANY_SIZE_OPTIONS = ["Solopreneur", "2-10", "11-50", "51-200", "200-500", "500+"]
const REVENUE_RANGE_OPTIONS = ["Under $500K", "$500K-$2M", "$2M-$10M", "$10M-$50M", "$50M+"]

interface IntakeForm {
  name: string
  title: string
  industry: string
  targetProspectDescription: string
  targetIndustries: string[]
  targetRoles: string[]
  companySizes: string[]
  revenueRanges: string[]
  professionalAssociations: string[]
  painPoint1: string
  painPoint2: string
  painPoint3: string
  decisionDrivers: string[]
  successMetric: string
  geographicArea: string
}

const emptyForm: IntakeForm = {
  name: "",
  title: "",
  industry: "",
  targetProspectDescription: "",
  targetIndustries: [],
  targetRoles: [],
  companySizes: [],
  revenueRanges: [],
  professionalAssociations: [],
  painPoint1: "",
  painPoint2: "",
  painPoint3: "",
  decisionDrivers: [],
  successMetric: "",
  geographicArea: "",
}

function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: number
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/25 text-sm font-bold text-primary">
        {number}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
  badgeVariant = "secondary",
  badgeClassName,
}: {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
  placeholder: string
  badgeVariant?: "secondary" | "default"
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
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={badgeVariant}
              className={cn("gap-1.5 pl-3 pr-2 py-1.5 text-sm", badgeClassName)}
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder={placeholder}
          className="bg-secondary/40 border-border/60 focus:border-primary/40"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAdd}
          className="h-10 w-10 p-0 shrink-0 border-border/60 hover:border-primary/40"
        >
          <Plus className="h-4 w-4" />
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
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150",
              isActive
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border/60 bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/8 hover:text-foreground"
            )}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function SuccessScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 border-2 border-primary/30">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">Profile Submitted!</h1>
          <p className="text-muted-foreground leading-relaxed">
            Your profile has been submitted! We'll have your personalized event recommendations ready for you soon.
          </p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-6 py-5">
          <div className="flex items-center gap-3 justify-center">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-foreground font-medium">
              Our team will review your networking goals and reach out with a curated list of events.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">You may now close this tab.</p>
      </div>
    </div>
  )
}

export function ClientIntakePage() {
  const [form, setForm] = useState<IntakeForm>(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof IntakeForm, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const addTag = (field: keyof IntakeForm, tag: string) => {
    const arr = form[field] as string[]
    if (!arr.includes(tag)) set(field, [...arr, tag])
  }

  const removeTag = (field: keyof IntakeForm, tag: string) => {
    const arr = form[field] as string[]
    set(field, arr.filter((t) => t !== tag))
  }

  const toggleChip = (field: keyof IntakeForm, value: string) => {
    const arr = form[field] as string[]
    set(
      field,
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: dbError } = await supabase.from("submitted_profiles").insert({
      name: form.name,
      industry: form.industry,
      title: form.title,
      target_prospect_description: form.targetProspectDescription,
      target_industries: form.targetIndustries,
      target_roles: form.targetRoles,
      company_sizes: form.companySizes,
      revenue_ranges: form.revenueRanges,
      professional_associations: form.professionalAssociations,
      pain_point_1: form.painPoint1,
      pain_point_2: form.painPoint2,
      pain_point_3: form.painPoint3,
      decision_drivers: form.decisionDrivers,
      success_metric_1: form.successMetric,
      success_metric_2: "",
      success_metric_3: "",
      geographic_area: form.geographicArea,
    })

    if (dbError) {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) return <SuccessScreen />

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground">Event Assistant</span>
            <span className="ml-2 text-xs text-muted-foreground">Networking Intelligence</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <div className="mb-10 sm:mb-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-balance text-foreground">
            Tell Us Who You Want to Meet
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            The more detail you share, the better we can match you with the right events and the right people.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="border-border/60 bg-card/80">
            <CardContent className="pt-8 pb-8 px-6 sm:px-8">
              <SectionHeader
                number={1}
                title="About You"
                subtitle="Tell us a bit about yourself so we know who's doing the networking."
              />
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="e.g. Sarah Mitchell"
                      className="bg-secondary/40 border-border/60 focus:border-primary/40"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-foreground">
                      Job Title
                    </Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder="e.g. Senior Consultant"
                      className="bg-secondary/40 border-border/60 focus:border-primary/40"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium text-foreground">
                    Your Industry
                  </Label>
                  <Input
                    id="industry"
                    value={form.industry}
                    onChange={(e) => set("industry", e.target.value)}
                    placeholder="e.g. Management Consulting, SaaS, Healthcare"
                    className="bg-secondary/40 border-border/60 focus:border-primary/40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardContent className="pt-8 pb-8 px-6 sm:px-8">
              <SectionHeader
                number={2}
                title="Who You Want to Meet"
                subtitle="Paint a picture of your ideal prospect — be as specific as possible."
              />
              <div className="space-y-2">
                <Textarea
                  value={form.targetProspectDescription}
                  onChange={(e) => set("targetProspectDescription", e.target.value)}
                  rows={5}
                  placeholder="e.g. I want to meet CFOs and Finance VPs at mid-market manufacturing companies ($25M–$250M revenue) in Texas who are evaluating process improvement programs or looking to reduce operational costs..."
                  className="resize-none bg-secondary/40 border-border/60 focus:border-primary/40 text-sm leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Aim for 150–400 characters for best results
                  </p>
                  <p
                    className={cn(
                      "text-xs tabular-nums",
                      form.targetProspectDescription.length >= 150 &&
                        form.targetProspectDescription.length <= 400
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {form.targetProspectDescription.length} chars
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardContent className="pt-8 pb-8 px-6 sm:px-8">
              <SectionHeader
                number={3}
                title="Target Industries"
                subtitle="Industries where your ideal prospects work. Type and press Enter to add."
              />
              <TagInput
                tags={form.targetIndustries}
                onAdd={(tag) => addTag("targetIndustries", tag)}
                onRemove={(tag) => removeTag("targetIndustries", tag)}
                placeholder="e.g. Manufacturing, Healthcare, Finance..."
              />
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardContent className="pt-8 pb-8 px-6 sm:px-8">
              <SectionHeader
                number={4}
                title="Target Roles"
                subtitle="Job titles and decision-maker roles you want to connect with."
              />
              <TagInput
                tags={form.targetRoles}
                onAdd={(tag) => addTag("targetRoles", tag)}
                onRemove={(tag) => removeTag("targetRoles", tag)}
                placeholder="e.g. CFO, VP Finance, COO, Controller..."
                badgeVariant="default"
                badgeClassName="bg-primary/15 text-primary border-primary/20"
              />
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardContent className="pt-8 pb-8 px-6 sm:px-8">
              <SectionHeader
                number={5}
                title="Their Company Profile"
                subtitle="What kind of organization does your ideal prospect work at?"
              />
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Company Size</Label>
                  <ChipSelector
                    options={COMPANY_SIZE_OPTIONS}
                    selected={form.companySizes}
                    onToggle={(v) => toggleChip("companySizes", v)}
                  />
                </div>

                <Separator className="border-border/40" />

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Annual Revenue Range</Label>
                  <ChipSelector
                    options={REVENUE_RANGE_OPTIONS}
                    selected={form.revenueRanges}
                    onToggle={(v) => toggleChip("revenueRanges", v)}
                  />
                </div>

                <Separator className="border-border/40" />

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">
                    Professional Associations
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Groups, associations, or networks your ideal prospect likely belongs to.
                  </p>
                  <TagInput
                    tags={form.professionalAssociations}
                    onAdd={(tag) => addTag("professionalAssociations", tag)}
                    onRemove={(tag) => removeTag("professionalAssociations", tag)}
                    placeholder="e.g. AICPA, YPO, ACG, Financial Executives International..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardContent className="pt-8 pb-8 px-6 sm:px-8">
              <SectionHeader
                number={6}
                title="Their Pain Points"
                subtitle="What are the top challenges your ideal prospect is actively trying to solve?"
              />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pain1" className="text-sm font-medium text-foreground">
                    Pain Point 1
                  </Label>
                  <Input
                    id="pain1"
                    value={form.painPoint1}
                    onChange={(e) => set("painPoint1", e.target.value)}
                    placeholder="e.g. Reducing operational costs while maintaining growth"
                    className="bg-secondary/40 border-border/60 focus:border-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pain2" className="text-sm font-medium text-foreground">
                    Pain Point 2
                  </Label>
                  <Input
                    id="pain2"
                    value={form.painPoint2}
                    onChange={(e) => set("painPoint2", e.target.value)}
                    placeholder="e.g. Improving financial reporting accuracy and speed"
                    className="bg-secondary/40 border-border/60 focus:border-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pain3" className="text-sm font-medium text-foreground">
                    Pain Point 3
                  </Label>
                  <Input
                    id="pain3"
                    value={form.painPoint3}
                    onChange={(e) => set("painPoint3", e.target.value)}
                    placeholder="e.g. Navigating technology transformation with limited in-house expertise"
                    className="bg-secondary/40 border-border/60 focus:border-primary/40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardContent className="pt-8 pb-8 px-6 sm:px-8">
              <SectionHeader
                number={7}
                title="What Drives Them"
                subtitle="Help us understand what motivates your ideal prospect and how they make decisions."
              />
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">
                    Top Things That Drive Their Decisions
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Key motivators that influence how this prospect evaluates solutions or partnerships.
                  </p>
                  <TagInput
                    tags={form.decisionDrivers}
                    onAdd={(tag) => addTag("decisionDrivers", tag)}
                    onRemove={(tag) => removeTag("decisionDrivers", tag)}
                    placeholder="e.g. ROI, peer recommendations, risk reduction, speed..."
                    badgeClassName="bg-chart-2/10 text-chart-2 border-chart-2/25"
                  />
                </div>

                <Separator className="border-border/40" />

                <div className="space-y-2">
                  <Label htmlFor="successMetric" className="text-sm font-medium text-foreground">
                    How They Measure Success
                  </Label>
                  <Input
                    id="successMetric"
                    value={form.successMetric}
                    onChange={(e) => set("successMetric", e.target.value)}
                    placeholder="e.g. 15% cost reduction within 12 months, faster close cycles..."
                    className="bg-secondary/40 border-border/60 focus:border-primary/40"
                  />
                </div>

                <Separator className="border-border/40" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="geo" className="text-sm font-medium text-foreground">
                      Geographic Area They Operate In
                    </Label>
                  </div>
                  <Input
                    id="geo"
                    value={form.geographicArea}
                    onChange={(e) => set("geographicArea", e.target.value)}
                    placeholder="e.g. Texas, Austin metro, Southeast US, National..."
                    className="bg-secondary/40 border-border/60 focus:border-primary/40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="pt-2 pb-10">
            <Button
              type="submit"
              size="lg"
              disabled={submitting || !form.name.trim()}
              className="w-full h-14 text-base font-semibold gap-2"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Submit My Profile
                </>
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Your information is used only to match you with relevant networking events.
            </p>
          </div>
        </form>
      </div>

      <div className="border-t border-border/30 py-6">
        <p className="text-center text-xs text-muted-foreground">
          Powered by Event Assistant · Networking Intelligence
        </p>
      </div>
    </div>
  )
}

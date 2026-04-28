import { useState } from "react"
import emailjs from "emailjs-com"
import {
  Lock,
  CircleCheck as CheckCircle,
  Sparkles,
  MapPin,
  Clock,
  Calendar,
  Users,
  ExternalLink,
  Globe,
  Repeat,
  DollarSign,
  Star,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  buildDemoReport,
  formatReportForEmail,
  type DemoFormData,
  type DemoGoal,
  type DemoReportData,
} from "@/utils/demoReport"
import { supabase } from "@/lib/supabase"

const GOALS: DemoGoal[] = ["Referrals", "Partnerships", "Clients", "Visibility", "Hiring"]

const DEMO_TEMPLATE_ID = "demo_snapshot_report"

type Screen = "code" | "form" | "report" | "success"

// --- Screen 1: Code Entry ---
function CodeScreen({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code === import.meta.env.VITE_DEMO_ACCESS_CODE) {
      onUnlock()
    } else {
      setError(true)
      setCode("")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-center">Enter Access Code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>Incorrect code — try again</AlertDescription>
              </Alert>
            )}
            <Input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(false)
              }}
              placeholder="••••••••"
              autoFocus
              className="text-center text-lg tracking-widest h-12"
            />
            <Button type="submit" className="w-full h-12 text-base" size="lg">
              Unlock Demo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Screen 2: Demo Entry Form ---
interface FormScreenProps {
  onGenerate: (data: DemoFormData) => void
}

function FormScreen({ onGenerate }: FormScreenProps) {
  const [name, setName] = useState("")
  const [industry, setIndustry] = useState("")
  const [goal, setGoal] = useState<DemoGoal | "">("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !industry.trim() || !goal || !email.trim()) {
      setError("Please fill in all fields.")
      return
    }
    setError("")
    onGenerate({ name: name.trim(), industry: industry.trim(), goal, email: email.trim() })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Quick Demo Report
            </span>
          </div>
          <CardTitle className="text-2xl">Your Networking Snapshot</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Answer 4 questions and get a personalized sample report in seconds.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Industry / Type of Business</label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Commercial Real Estate"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Your #1 Networking Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as DemoGoal)}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="" disabled>
                  Select your goal...
                </option>
                {GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 text-base"
              />
            </div>

            <Button type="submit" className="w-full h-14 text-base font-semibold mt-2" size="lg">
              Generate My Report
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Screen 3: Demo Report ---
interface ReportScreenProps {
  formData: DemoFormData
  report: DemoReportData
  onSend: () => void
  sending: boolean
  sendError: string
}

function ReportScreen({ formData, report, onSend, sending, sendError }: ReportScreenProps) {
  const { event, org } = report

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-lg mx-auto space-y-5">

        {/* SAMPLE REPORT banner + header */}
        <Card className="relative overflow-hidden border-2 border-foreground/10">
          {/* Full-width sample banner */}
          <div className="bg-foreground text-background text-center py-2 px-4">
            <span className="text-xs font-bold uppercase tracking-widest">Sample Report</span>
          </div>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Networking Snapshot Report
            </p>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {formData.name}'s Networking Snapshot
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Goal: <span className="font-medium text-foreground">{formData.goal}</span>
              {" · "}
              Industry: <span className="font-medium text-foreground">{formData.industry}</span>
            </p>
          </CardContent>
        </Card>

        {/* Personalized intro */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-sm leading-relaxed text-foreground">{report.intro}</p>
          </CardContent>
        </Card>

        {/* ── EVENT RECOMMENDATION ── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">
            Upcoming Event to Attend
          </h2>

          <Card>
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg leading-snug">{event.title}</CardTitle>
                <Badge variant="secondary" className="shrink-0 text-xs whitespace-nowrap mt-0.5">
                  {event.eventType}
                </Badge>
              </div>

              {/* Date / time / venue row */}
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{event.date}</span>
                  <span className="text-border">·</span>
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-medium text-foreground">{event.venueName}</span>
                    {" — "}
                    {event.address}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-5 space-y-4">
              {/* About the event */}
              <p className="text-sm text-foreground leading-relaxed">{event.description}</p>

              <Separator />

              {/* Why recommended */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Why This Is Recommended for You
                </p>
                <p className="text-sm text-foreground leading-relaxed">{event.whyMatch}</p>
              </div>

              <Separator />

              {/* Metadata row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <Users className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                    <p className="text-sm font-medium text-foreground">{event.attendanceNote}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Hosted By</p>
                    <p className="text-sm font-medium text-foreground">{event.hostedBy}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 col-span-2">
                  <DollarSign className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cost / Registration</p>
                    <p className="text-sm font-medium text-foreground">{event.costNote}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Register CTA */}
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-10 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View Registration / Event Details
              </a>
            </CardContent>
          </Card>
        </div>

        {/* ── ORGANIZATION RECOMMENDATION ── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">
            Organization to Join
          </h2>

          <Card>
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg leading-snug">{org.name}</CardTitle>
                <Badge variant="outline" className="shrink-0 text-xs whitespace-nowrap mt-0.5">
                  {org.primaryBenefit}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  {org.website.replace("https://", "")}
                </a>
              </div>
            </CardHeader>

            <CardContent className="pb-5 space-y-4">
              {/* Description */}
              <p className="text-sm text-foreground leading-relaxed">{org.description}</p>

              <Separator />

              {/* Why recommended */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Why This Is Recommended for You
                </p>
                <p className="text-sm text-foreground leading-relaxed">{org.whyJoin}</p>
              </div>

              <Separator />

              {/* Metadata row */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-2">
                  <Repeat className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Meeting Frequency & Format</p>
                    <p className="text-sm font-medium text-foreground">{org.meetingFrequency}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Membership Cost / How to Join</p>
                    <p className="text-sm font-medium text-foreground">{org.membershipCost}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Primary Benefit</p>
                    <p className="text-sm font-medium text-foreground">{org.primaryBenefit}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── SAMPLE NOTE ── */}
        <Card className="bg-muted/40 border-dashed">
          <CardContent className="py-5">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              This is a 2-item sample. Your full report includes a complete list of recommended
              events and organizations personalized to your profile. The more information you
              provide, the more accurate your results.
            </p>
          </CardContent>
        </Card>

        {/* ── LOCKED SECTION ── */}
        <div className="relative rounded-xl overflow-hidden border bg-card">
          {/* Blurred content behind the lock overlay */}
          <div className="select-none pointer-events-none blur-sm opacity-40 px-5 py-5 space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-1.5">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-5/6" />
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-[2px] px-6 py-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-foreground/10">
              <Lock className="h-6 w-6 text-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground text-center">
              Your full report includes more events and organizations
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Personalized to your industry, goal, and schedule
            </p>
            <Button className="mt-1 h-10 px-6 text-sm font-semibold" size="default">
              Get Full Report
            </Button>
          </div>
        </div>

        {/* Send email section */}
        {sendError && (
          <Alert variant="destructive">
            <AlertDescription>{sendError}</AlertDescription>
          </Alert>
        )}

        <Button
          className="w-full h-14 text-base font-semibold"
          size="lg"
          onClick={onSend}
          disabled={sending}
        >
          {sending ? "Sending..." : "Send to My Email"}
        </Button>

        {/* Footer CTA */}
        <Card className="border-foreground/10 bg-muted/30">
          <CardContent className="py-5 text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Want your full personalized report?
            </p>
            <p className="text-sm text-muted-foreground">
              Michael Espinoza · 210-370-7550
            </p>
            <p className="text-sm text-muted-foreground">
              michael@texasbusinesscalendars.com
            </p>
            <p className="text-sm font-medium text-foreground mt-2">
              Contact Michael to start your Event Assistant subscription.
            </p>
          </CardContent>
        </Card>

        <div className="h-4" />
      </div>
    </div>
  )
}

// --- Screen 4: Success ---
function SuccessScreen({ name, onStartOver }: { name: string; onStartOver: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-sm text-center">
        <CardContent className="pt-10 pb-8 space-y-4">
          <CheckCircle className="h-14 w-14 text-chart-4 mx-auto" />
          <h2 className="text-xl font-bold text-foreground">
            Report sent! Check your inbox, {name}.
          </h2>
          <p className="text-sm text-muted-foreground">
            Your networking snapshot is on its way.
          </p>
          <Button
            variant="outline"
            className="w-full h-12 text-base mt-2"
            onClick={onStartOver}
          >
            Start Over
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Main DemoPage ---
export function DemoPage() {
  const [screen, setScreen] = useState<Screen>("code")
  const [formData, setFormData] = useState<DemoFormData | null>(null)
  const [report, setReport] = useState<DemoReportData | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState("")

  const handleUnlock = () => {
    setScreen("form")
  }

  const handleGenerate = async (data: DemoFormData) => {
    const built = buildDemoReport(data)
    setFormData(data)
    setReport(built)

    // Save lead — fire and forget, don't block the UI
    supabase
      .from("demo_leads")
      .insert({ name: data.name, email: data.email, industry: data.industry, goal: data.goal })
      .then(() => {})

    setScreen("report")
  }

  const handleSend = async () => {
    if (!formData || !report) return

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!serviceId || !publicKey) {
      setSendError("Email is not configured yet. Here's your report on screen!")
      return
    }

    setSending(true)
    setSendError("")

    try {
      emailjs.init(publicKey)
      await emailjs.send(serviceId, DEMO_TEMPLATE_ID, {
        to_name: formData.name,
        to_email: formData.email,
        industry: formData.industry,
        goal: formData.goal,
        report_sections: formatReportForEmail(report, formData),
        cta_contact:
          "Michael Espinoza | 210-370-7550 | michael@texasbusinesscalendars.com\nContact Michael to start your Event Assistant subscription.",
      })
      setScreen("success")
    } catch {
      setSendError("Something went wrong — but here's your report on screen!")
    } finally {
      setSending(false)
    }
  }

  const handleStartOver = () => {
    setScreen("code")
    setFormData(null)
    setReport(null)
    setSendError("")
  }

  if (screen === "code") return <CodeScreen onUnlock={handleUnlock} />
  if (screen === "form") return <FormScreen onGenerate={handleGenerate} />
  if (screen === "report" && formData && report)
    return (
      <ReportScreen
        formData={formData}
        report={report}
        onSend={handleSend}
        sending={sending}
        sendError={sendError}
      />
    )
  if (screen === "success" && formData)
    return <SuccessScreen name={formData.name} onStartOver={handleStartOver} />

  return null
}

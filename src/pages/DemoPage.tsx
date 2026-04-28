import { useState } from "react"
import emailjs from "emailjs-com"
import { Lock, CircleCheck as CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { buildDemoReport, type DemoFormData, type DemoGoal, type DemoReportData } from "@/utils/demoReport"
import { supabase } from "@/lib/supabase"

const GOALS: DemoGoal[] = ["Referrals", "Partnerships", "Clients", "Visibility", "Hiring"]

const DEMO_TEMPLATE_ID = "demo_snapshot_report"

type Screen = "code" | "form" | "report" | "success"

function formatReportForEmail(report: DemoReportData): string {
  const eventLines = report.events
    .map(
      (e, i) =>
        `EVENT ${i + 1}: ${e.title}\nDate: ${e.date}\nLocation: ${e.location}\nWhy: ${e.whyMatch}`
    )
    .join("\n\n")

  const orgLine = `ORGANIZATION: ${report.org.name}\nCategory: ${report.org.category}\nWhy Join: ${report.org.whyJoin}`

  return `INTRO:\n${report.intro}\n\n${eventLines}\n\n${orgLine}\n\nNote: The more information you provide, the more personalized and accurate your recommendations will be.`
}

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
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header card with DEMO badge */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <Badge className="bg-chart-4 text-background font-bold tracking-wider text-xs px-2 py-0.5">
              DEMO
            </Badge>
          </div>
          <CardContent className="pt-6 pb-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Networking Snapshot Report
            </p>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {formData.name}'s Networking Snapshot
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sample Report — Full version available from Event Assistant
            </p>
          </CardContent>
        </Card>

        {/* Personalized intro */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-sm leading-relaxed text-foreground">{report.intro}</p>
          </CardContent>
        </Card>

        {/* Event recommendations */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">
            Upcoming Events to Attend
          </h2>
          <div className="space-y-3">
            {report.events.map((event, i) => (
              <Card key={i}>
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{event.title}</CardTitle>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      #{i + 1}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {event.date} · {event.location}
                  </p>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-foreground leading-relaxed">{event.whyMatch}</p>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3 shrink-0" />
                    <span>Full detail in your complete report</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Organization recommendation */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">
            Organization to Join
          </h2>
          <Card>
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">{report.org.name}</CardTitle>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {report.org.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-foreground leading-relaxed">{report.org.whyJoin}</p>
              <Separator className="my-3" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3 shrink-0" />
                <span>Full detail in your complete report</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personalization note */}
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground italic text-center">
              The more information you provide, the more personalized and accurate your recommendations will be.
            </p>
          </CardContent>
        </Card>

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
        <Card className="border-primary/20 bg-primary/5">
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
        report_sections: formatReportForEmail(report),
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

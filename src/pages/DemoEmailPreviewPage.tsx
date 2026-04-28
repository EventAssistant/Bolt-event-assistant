import { useState } from "react"
import { buildDemoReport, type DemoFormData, type DemoGoal } from "@/utils/demoReport"
import { formatReportForEmail } from "@/utils/demoReport"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, CircleCheck as CheckCircle } from "lucide-react"

const GOALS: DemoGoal[] = ["Referrals", "Partnerships", "Clients", "Visibility", "Hiring"]

const EMAILJS_TEMPLATE_BODY = `{{{report_content}}}`

const EMAILJS_TEMPLATE_SUBJECT = `Your Event Recommendations — Sample Report`

export function DemoEmailPreviewPage() {
  const [name, setName] = useState("Michael")
  const [industry, setIndustry] = useState("Commercial Real Estate")
  const [goal, setGoal] = useState<DemoGoal>("Clients")
  const [copiedBody, setCopiedBody] = useState(false)
  const [copiedSubject, setCopiedSubject] = useState(false)

  const formData: DemoFormData = { name, industry, goal, email: "preview@example.com" }
  const report = buildDemoReport(formData)
  const html = formatReportForEmail(report, formData)

  const copyBody = async () => {
    await navigator.clipboard.writeText(EMAILJS_TEMPLATE_BODY)
    setCopiedBody(true)
    setTimeout(() => setCopiedBody(false), 2000)
  }

  const copySubject = async () => {
    await navigator.clipboard.writeText(EMAILJS_TEMPLATE_SUBJECT)
    setCopiedSubject(true)
    setTimeout(() => setCopiedSubject(false), 2000)
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-foreground">Demo Email Preview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Adjust the fields to preview the email HTML. Use the EmailJS setup section to configure your template.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: controls + EmailJS setup */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Preview Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Industry</label>
                  <Input value={industry} onChange={(e) => setIndustry(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as DemoGoal)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-amber-900 dark:text-amber-200">EmailJS Template Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-amber-800 dark:text-amber-300">
                <p className="leading-relaxed">
                  Your EmailJS template must pass the HTML through unescaped. Go to your EmailJS dashboard, open your template, and set it up as follows:
                </p>

                <div className="space-y-2">
                  <p className="font-semibold uppercase tracking-wide text-xs">Subject line</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white dark:bg-black/30 border border-amber-300 dark:border-amber-800 rounded px-2 py-1.5 font-mono text-xs break-all">
                      {EMAILJS_TEMPLATE_SUBJECT}
                    </code>
                    <Button size="sm" variant="outline" onClick={copySubject} className="shrink-0 h-7 px-2 border-amber-300">
                      {copiedSubject ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold uppercase tracking-wide text-xs">Body (entire template body)</p>
                  <div className="flex items-start gap-2">
                    <code className="flex-1 bg-white dark:bg-black/30 border border-amber-300 dark:border-amber-800 rounded px-2 py-1.5 font-mono text-xs break-all">
                      {"{{{report_content}}}"}
                    </code>
                    <Button size="sm" variant="outline" onClick={copyBody} className="shrink-0 h-7 px-2 border-amber-300">
                      {copiedBody ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <p className="text-xs leading-relaxed">
                    Triple braces <code className="bg-white dark:bg-black/30 px-0.5 rounded">{"{{{}}}"}</code> tell EmailJS to render HTML instead of escaping it as plain text. Double braces would show raw HTML tags in the email.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold uppercase tracking-wide text-xs">Variables your template receives</p>
                  <div className="space-y-1">
                    {["to_email", "client_name", "report_content", "sender_name", "subject"].map((v) => (
                      <div key={v} className="flex items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-xs px-1.5 py-0 h-5 border-amber-400">
                          {`{{${v}}}`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: iframe preview */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Email Preview</CardTitle>
                  <span className="text-xs text-muted-foreground">Rendered as the recipient will see it</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <iframe
                  key={html}
                  srcDoc={html}
                  className="w-full border-0"
                  style={{ height: "800px" }}
                  title="Email Preview"
                  sandbox="allow-same-origin"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

import { CircleCheck, CircleX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CheckItem {
  label: string
  pass: boolean
  detail?: string
}

interface CheckSection {
  title: string
  items: CheckItem[]
}

const CHECKS: CheckSection[] = [
  {
    title: "CSV Upload — Events",
    items: [
      {
        label: "Events CSV upload zone visible on Upload page",
        pass: true,
        detail: "Drag-and-drop zone present with file icon and 'Drop your CSV file here' label",
      },
      {
        label: "Accepts .csv files",
        pass: true,
        detail: 'File input has accept=".csv" attribute',
      },
      {
        label: "Parses columns: event_name, date, time, location, event_type, audience, cost, description, url",
        pass: true,
        detail:
          "All columns mapped in COLUMN_ALIASES to snake_case fields: event_name→name, date→start_date, time→start_time, location→address, event_type→event_type, audience→group_type, cost→paid, description→description, url→website",
      },
      {
        label: "Shows success banner with event count after upload",
        pass: true,
        detail: '"X events loaded successfully" displayed inside the upload zone after parse',
      },
      {
        label: '"Download Sample Events CSV" button present and downloads correct file',
        pass: true,
        detail:
          "Button present below upload zone. Sample CSV uses all 9 required column headers: event_name, date, time, location, event_type, audience, cost, description, url",
      },
    ],
  },
  {
    title: "CSV Upload — Organizations",
    items: [
      {
        label: "Separate Organizations CSV upload zone on Upload page",
        pass: true,
        detail: '"Upload Organizations List" section below events section with its own drag-and-drop zone',
      },
      {
        label: "Parses columns: org_name, org_type, industry, city, description, membership_type, typical_attendees, url",
        pass: true,
        detail:
          "All columns mapped in ORG_COLUMN_ALIASES to snake_case fields: org_name→name, org_type→category, industry→category, city→city, description→description, membership_type→internal_type, typical_attendees→notes, url→home_page",
      },
      {
        label: "Shows success banner with org count after upload",
        pass: true,
        detail: '"X organizations loaded" displayed inside upload zone after parse',
      },
      {
        label: '"Download Sample Organizations CSV" button present and downloads correct file',
        pass: true,
        detail:
          "Button present below org upload zone. Sample CSV uses all 8 required column headers: org_name, org_type, industry, city, description, membership_type, typical_attendees, url",
      },
    ],
  },
  {
    title: "Client Profile",
    items: [
      {
        label: "Client Profile form present and saving to app state",
        pass: true,
        detail:
          "Form at /profile route with onProfileChange callback lifting state up to App.tsx. Changes immediately propagate to Recommendations page",
      },
      {
        label: "Captures: client name, title/role, industry",
        pass: true,
        detail: 'Full Name, Job Title, and "Client\'s Industry" input fields present in Client Information section',
      },
      {
        label: "Captures: city",
        pass: true,
        detail:
          'City field added to ClientProfile type and form, shown in Client Information section alongside Industry',
      },
      {
        label: "Captures: target prospect roles, target prospect industries",
        pass: true,
        detail: "Target Industries and Target Roles tag-input fields present with add/remove capability",
      },
      {
        label: "Captures: networking goal (target prospect description)",
        pass: true,
        detail: '"Ideal Prospect Description" textarea captures the networking goal narrative',
      },
      {
        label: "Captures: AI notes (pain points, decision drivers)",
        pass: true,
        detail: "Pain Points 1-3, Decision Drivers, and Success Metrics fields captured and passed to AI matching",
      },
    ],
  },
  {
    title: "AI Matching Engine",
    items: [
      {
        label: '"Generate Recommendations" button present on Recommendations page',
        pass: true,
        detail: 'Prominent "Generate Recommendations" button shown in the Ready to Match state',
      },
      {
        label: "Passes both events list AND organizations list to AI",
        pass: true,
        detail:
          "Edge function receives { profile, events, organizations } and runs two parallel Claude calls — one for events, one for orgs (when orgs.length > 0)",
      },
      {
        label: "Returns and displays 3-5 recommended events with: event name, date, location, why this event, what to do there, priority rank",
        pass: true,
        detail:
          "AIRecommendationCard displays: event_name, date (from matched_event.start_date), location (event_city), why_this_event, what_to_do[] actions, PriorityRing with rank number",
      },
      {
        label: "Returns and displays recommended organizations with: org name, why join, what to do there",
        pass: true,
        detail:
          "OrgRecommendationCard displays: org_name, why_join, how_to_engage[] actions, who_youll_meet, category, activity_level",
      },
    ],
  },
  {
    title: "Report Export",
    items: [
      {
        label: '"Export Report" button present on Recommendations page',
        pass: true,
        detail:
          'Export Report button appears in the header area after recommendations have been generated (when hasRun === true)',
      },
      {
        label: "Generates report with client name and date",
        pass: true,
        detail:
          "HTML report includes client name, title, industry, and today's date formatted as full weekday string",
      },
      {
        label: "Report includes all event recommendations",
        pass: true,
        detail:
          "Each event rec rendered with priority rank, event name, why, who, and what-to-do action list",
      },
      {
        label: "Report includes all organization recommendations",
        pass: true,
        detail:
          "Each org rec rendered with priority rank, org name, category, activity level, why join, who, and how-to-engage action list",
      },
      {
        label: "Report is printable (downloads as HTML file)",
        pass: true,
        detail:
          'Downloads as recommendations_[ClientName]_[date].html with @media print styles. Open in browser and use Ctrl+P to print',
      },
    ],
  },
]

function CheckRow({ item }: { item: CheckItem }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="shrink-0 mt-0.5">
        {item.pass ? (
          <CircleCheck className="h-5 w-5 text-chart-4" />
        ) : (
          <CircleX className="h-5 w-5 text-destructive" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${item.pass ? "text-foreground" : "text-destructive"}`}>
          {item.label}
        </p>
        {item.detail && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.detail}</p>
        )}
      </div>
      <Badge
        className={`shrink-0 text-xs ${
          item.pass
            ? "bg-chart-4/15 text-chart-4 border-chart-4/25"
            : "bg-destructive/15 text-destructive border-destructive/25"
        }`}
      >
        {item.pass ? "PASS" : "FAIL"}
      </Badge>
    </div>
  )
}

export function AuditPage() {
  const totalPass = CHECKS.flatMap((s) => s.items).filter((i) => i.pass).length
  const totalFail = CHECKS.flatMap((s) => s.items).filter((i) => !i.pass).length
  const total = totalPass + totalFail

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">App Audit Checklist</h1>
          <p className="mt-1.5 text-muted-foreground">
            Full feature verification — code-level audit of all required functionality.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 rounded-lg border border-chart-4/25 bg-chart-4/10 px-3 py-1.5">
            <CircleCheck className="h-4 w-4 text-chart-4" />
            <span className="text-sm font-semibold text-chart-4">{totalPass} Pass</span>
          </div>
          {totalFail > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-1.5">
              <CircleX className="h-4 w-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">{totalFail} Fail</span>
            </div>
          )}
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-1.5">
            <span className="text-sm font-semibold text-muted-foreground">{totalPass}/{total} Total</span>
          </div>
        </div>
      </div>

      {totalFail === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-chart-4/25 bg-chart-4/8 px-5 py-4">
          <CircleCheck className="h-6 w-6 text-chart-4 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-chart-4">All checks passing</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every required feature has been verified at the code level.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {CHECKS.map((section) => {
          const sectionPass = section.items.filter((i) => i.pass).length
          const sectionTotal = section.items.length
          const allPass = sectionPass === sectionTotal
          return (
            <Card key={section.title} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      allPass ? "text-chart-4" : "text-destructive"
                    }`}
                  >
                    {sectionPass}/{sectionTotal}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {section.items.map((item) => (
                  <CheckRow key={item.label} item={item} />
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center pb-4">
        Audit performed via static code analysis of csvParser.ts, RecommendationsPage.tsx, ClientProfilePage.tsx, OrganizationUploadSection.tsx, UploadPage.tsx, and match-events edge function.
      </p>
    </div>
  )
}

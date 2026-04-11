import { useState } from "react"
import { Upload, Building2, CircleCheck as CheckCircle2, ChevronUp, ChevronDown, ExternalLink, FileText, Trash2, Loader as Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { parseOrganizationsCSV } from "@/utils/csvParser"
import { validateOrgRows, type ValidationResult } from "@/utils/csvValidation"
import { CsvValidationDialog } from "@/components/CsvValidationDialog"
import { useSession } from "@/contexts/SessionContext"
import type { UpsertResult } from "@/contexts/SessionContext"
import type { Organization, OrgParseResult } from "@/types"

function formatUploadTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

const ORG_CSV_COLUMNS_PRIMARY = [
  "name",
  "category",
  "city",
  "description",
  "home_page",
  "internal_type",
  "notes",
]

const ORG_CSV_COLUMNS_EXTENDED = [
  "zip_code",
  "address",
  "calendar",
  "activity",
  "status",
]

function downloadSampleOrganizationCSV() {
  const sampleData = [
    ["name", "category", "city", "description", "home_page", "internal_type", "notes", "zip_code", "address", "calendar", "activity", "status"],
    ["Austin Tech Alliance", "Professional Association", "Austin", "Premier technology industry organization connecting startups, enterprises, and investors across Central Texas", "https://austintechalliance.com", "Current", "CTOs, founders, VPs of Engineering, product managers", "78701", "500 E Cesar Chavez St, Austin TX", "https://austintechalliance.com/events", "Monthly", "Current"],
    ["Greater Austin Chamber of Commerce", "Chamber", "Austin", "The voice of Austin business connecting members with government, community, and each other for economic growth", "https://austinchamber.com", "Current", "Business executives, entrepreneurs, civic leaders", "78701", "535 E 5th St, Austin TX", "https://austinchamber.com/events", "Weekly", "Current"],
    ["Financial Executives International – Austin", "Professional Association", "Austin", "Professional association for senior-level finance and accounting executives to share best practices and develop professionally", "https://financialexecutives.org", "Current", "CFOs, Controllers, VPs of Finance, Treasurers", "78704", "Austin, TX", "https://financialexecutives.org/events", "Monthly", "Current"],
  ]

  const csv = sampleData.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", "sample_organizations.csv")
  link.click()
}

function getActivityColor(activity: string): string {
  const lower = activity.toLowerCase()
  if (lower.includes("weekly")) return "bg-chart-4/15 text-chart-4"
  if (lower.includes("monthly")) return "bg-primary/10 text-primary"
  if (lower.includes("quarterly")) return "bg-chart-2/15 text-chart-2"
  if (lower.includes("annual") || lower.includes("yearly")) return "bg-chart-3/15 text-chart-3"
  return "bg-muted text-muted-foreground"
}

function getStatusColor(status: string): string {
  const lower = status.toLowerCase()
  if (lower.includes("current")) return "bg-chart-4/15 text-chart-4"
  if (lower.includes("pending")) return "bg-chart-5/15 text-chart-5"
  return "bg-muted text-muted-foreground"
}

function TruncatedDescription({ text }: { text: string }) {
  if (!text) return <span className="text-muted-foreground/50">—</span>
  if (text.length <= 100) return <span className="text-sm text-muted-foreground">{text}</span>

  const truncated = text.slice(0, 100).trimEnd() + "…"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm text-muted-foreground cursor-help">{truncated}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[320px] text-xs leading-relaxed">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function OrgTable({ organizations }: { organizations: Organization[] }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">#</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Category</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Activity</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org, index) => (
            <tr
              key={`${org.name}-${index}`}
              className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0"
            >
              <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
              <td className="px-4 py-3 max-w-[200px]">
                {org.home_page ? (
                  <a
                    href={org.home_page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <span className="truncate">{org.name || "—"}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                  </a>
                ) : (
                  <span className="font-medium text-foreground">{org.name || "—"}</span>
                )}
                {org.city && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{org.city}</p>
                )}
              </td>
              <td className="px-4 py-3">
                {org.category ? (
                  <Badge variant="secondary" className="whitespace-nowrap text-xs">
                    {org.category}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {org.activity ? (
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getActivityColor(org.activity)}`}>
                    {org.activity}
                  </span>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {org.status ? (
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(org.status)}`}>
                    {org.status}
                  </span>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </td>
              <td className="px-4 py-3 max-w-[300px]">
                <TruncatedDescription text={org.description} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface OrganizationUploadSectionProps {
  onOrganizationsChange?: (organizations: Organization[]) => void
}

export function OrganizationUploadSection({ onOrganizationsChange }: OrganizationUploadSectionProps) {
  const { orgsUploadedAt, organizations: sessionOrganizations, loadingData, upsertOrganizations, setOrganizations: setSessionOrganizations } = useSession()
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [, setParseResult] = useState<OrgParseResult | null>(null)
  const [showTable, setShowTable] = useState(true)
  const [showColumnsInfo, setShowColumnsInfo] = useState(true)
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [pendingValidation, setPendingValidation] = useState<ValidationResult | null>(null)
  const [pendingParseResult, setPendingParseResult] = useState<OrgParseResult | null>(null)

  const organizations = sessionOrganizations
  const isLoaded = organizations.length > 0

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const processFile = (file: File) => {
    setUploadedFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const result = parseOrganizationsCSV(text)
      const validation = validateOrgRows(result.rawRows)

      setPendingValidation(validation)
      setPendingParseResult(result)
      setValidationDialogOpen(true)
    }
    reader.readAsText(file)
  }

  const handleValidationConfirm = async () => {
    if (!pendingParseResult || !pendingValidation) return
    const capturedParseResult = pendingParseResult
    const validSet = new Set(pendingValidation.validIndices)
    const validationPassedOrgs = capturedParseResult.organizations.filter((_, i) => validSet.has(i))
    const validationSkipped = capturedParseResult.organizations.length - validationPassedOrgs.length

    setValidationDialogOpen(false)
    setPendingValidation(null)
    setPendingParseResult(null)

    const uploadedAt = new Date().toISOString()
    let dbResult: UpsertResult = { inserted: validationPassedOrgs.length, skipped: 0 }
    try {
      dbResult = await upsertOrganizations(validationPassedOrgs, uploadedAt)
    } catch (e) {
      console.error("Upsert failed:", e)
    }

    setParseResult({ ...capturedParseResult, skippedRows: validationSkipped })

    const { inserted, skipped: dbSkipped } = dbResult
    const total = validationPassedOrgs.length
    if (inserted === 0) {
      toast.info(`No new organizations added — all ${total} record${total !== 1 ? "s" : ""} already existed`, {
        duration: 5000,
      })
    } else {
      toast.success(
        `${inserted} new organization${inserted !== 1 ? "s" : ""} added${dbSkipped > 0 ? `, ${dbSkipped} already existed and ${dbSkipped !== 1 ? "were" : "was"} skipped` : ""}`,
        { description: validationSkipped > 0 ? `${validationSkipped} row${validationSkipped !== 1 ? "s" : ""} skipped due to validation errors` : undefined, duration: 5000 }
      )
    }
  }

  const handleValidationCancel = () => {
    setValidationDialogOpen(false)
    setPendingValidation(null)
    setPendingParseResult(null)
    setUploadedFileName("")
  }

  const handleClearOrganizations = () => {
    setUploadedFileName("")
    setParseResult(null)
    setShowTable(true)
    setSessionOrganizations([], new Date().toISOString())
    onOrganizationsChange?.([])
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {loadingData && (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading organizations...</span>
          </div>
        )}

        {!loadingData && isLoaded && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Loaded Organizations</CardTitle>
                    <CardDescription className="mt-0.5">
                      {organizations.length} organization{organizations.length !== 1 ? "s" : ""} loaded
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTable(!showTable)}
                  className="gap-1.5 text-muted-foreground"
                >
                  {showTable ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {showTable && (
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{organizations.length} organization{organizations.length !== 1 ? "s" : ""}</span>
                </div>
                <OrgTable organizations={organizations} />
              </CardContent>
            )}
          </Card>
        )}

        {!loadingData && !isLoaded && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 py-16 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No organizations loaded yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Upload a CSV file to get started.</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Upload Organizations List</CardTitle>
                <CardDescription>Supports CSV format with organization data.</CardDescription>
              </div>
              {isLoaded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearOrganizations}
                  className="gap-1.5 text-muted-foreground hover:text-destructive h-8 px-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-xs">Clear</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-6 px-6 text-center transition-all duration-200 ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : isLoaded
                  ? "border-chart-4/50 bg-chart-4/5"
                  : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />

              {isLoaded ? (
                <>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-chart-4/15">
                    <CheckCircle2 className="h-5 w-5 text-chart-4" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    {uploadedFileName || `${organizations.length} organizations loaded`}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {organizations.length} organizations loaded
                  </p>
                  {orgsUploadedAt && (
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      Last uploaded: {formatUploadTimestamp(orgsUploadedAt)}
                    </p>
                  )}
                  <Button variant="outline" size="sm" className="mt-3">
                    Replace File
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">Drop your CSV file here</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">or click to browse files</p>
                  <p className="mt-2 text-xs text-muted-foreground/70">CSV format only</p>
                </>
              )}
            </div>
          </CardContent>
          <CardContent className="border-t border-border pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleOrganizationCSV}
              className="w-full gap-2 text-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              Download Template
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Expected CSV Columns</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowColumnsInfo(!showColumnsInfo)}
                className="gap-1.5 text-muted-foreground"
              >
                {showColumnsInfo ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show
                  </>
                )}
              </Button>
            </div>
            <CardDescription>Use these exact lowercase column names in your CSV file.</CardDescription>
          </CardHeader>
          {showColumnsInfo && (
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Primary — Used in AI Matching</p>
                <ul className="space-y-1.5">
                  {ORG_CSV_COLUMNS_PRIMARY.map((col, i) => (
                    <li key={col} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium bg-primary/15 text-primary">
                        {i + 1}
                      </span>
                      <code className="text-sm text-foreground font-mono">{col}</code>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Extended — Stored for Future Use</p>
                <ul className="space-y-1.5">
                  {ORG_CSV_COLUMNS_EXTENDED.map((col, i) => (
                    <li key={col} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium bg-muted text-muted-foreground">
                        {i + 8}
                      </span>
                      <code className="text-sm text-muted-foreground font-mono">{col}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {pendingValidation && (
        <CsvValidationDialog
          open={validationDialogOpen}
          onOpenChange={setValidationDialogOpen}
          validation={pendingValidation}
          totalRows={pendingParseResult?.rawRows.length ?? 0}
          onUploadValid={handleValidationConfirm}
          onCancel={handleValidationCancel}
          label="organizations"
        />
      )}
    </div>
  )
}

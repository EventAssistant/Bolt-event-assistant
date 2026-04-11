import { useState, useMemo } from "react"
import {
  Upload,
  FileText,
  CircleCheck as CheckCircle2,
  CircleAlert as AlertCircle,
  ChevronUp,
  ChevronDown,
  Table2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  TriangleAlert,
  Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { parseCSV } from "@/utils/csvParser"
import { validateEventRows, type ValidationResult } from "@/utils/csvValidation"
import { CsvValidationDialog } from "@/components/CsvValidationDialog"
import { OrganizationUploadSection } from "@/components/OrganizationUploadSection"
import type { Event, ParseResult, Organization } from "@/types"

const CSV_COLUMNS = [
  "name",
  "start_date",
  "start_time",
  "address",
  "event_type",
  "group_type",
  "paid",
  "description",
  "website",
  "id",
  "end_date",
  "end_time",
  "city_calendar",
  "event_city",
  "state",
  "zipcode",
  "group_name",
  "source",
  "notes",
  "group_id",
  "participation",
  "internal_type",
  "part_of_town",
  "subcategory",
]

const PAGE_SIZE = 20

function downloadSampleEventCSV() {
  const sampleData = [
    ["name", "start_date", "start_time", "address", "event_type", "group_type", "paid", "description", "website", "end_date", "end_time", "event_city", "state", "group_name", "participation", "internal_type", "subcategory"],
    ["Austin Tech Summit 2025", "2025-02-14", "8:00 AM", "123 Tech Drive, Austin TX", "Conference", "Business/Industry", "Paid", "Annual technology conference bringing together startup founders and enterprise executives", "https://austintechsummit.com", "2025-02-15", "5:00 PM", "Austin", "TX", "Austin Tech Alliance", "In-Person", "Current", "Technology,Startups"],
    ["Austin Networking Breakfast", "2025-02-20", "7:30 AM", "500 Corporate Plaza, Austin TX", "Networking", "Networking", "Free", "Monthly breakfast networking event for local business leaders", "https://austinbusinessnetwork.com", "2025-02-20", "9:00 AM", "Austin", "TX", "Austin Business Network", "In-Person", "Current", "Business,Professional Services"],
    ["CFO Leadership Forum", "2025-02-25", "9:00 AM", "200 Congress Ave, Austin TX", "Educational", "Business/Industry", "Paid", "Exclusive forum for CFOs and senior finance executives to discuss financial strategy", "https://cfoforumaustin.com", "2025-02-25", "4:00 PM", "Austin", "TX", "Finance Leaders Network", "In-Person", "Current", "Finance,Leadership"],
  ]

  const csv = sampleData.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", "sample_events.csv")
  link.click()
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr + "T12:00:00")
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "—"
  const [h, m] = timeStr.split(":").map(Number)
  if (isNaN(h)) return timeStr
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, "0")} ${period}`
}

function EventTable({ events }: { events: Event[] }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">#</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Event Name</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Organization</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Date</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Time</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Cost</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Format</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">City</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr
              key={event.id}
              className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0"
            >
              <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
              <td className="px-4 py-3 max-w-[240px]">
                {event.website ? (
                  <a
                    href={event.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <span className="truncate">{event.name || "—"}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                  </a>
                ) : (
                  <span className="font-medium text-foreground">{event.name || "—"}</span>
                )}
                {event.subcategory.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {event.subcategory.slice(0, 2).map((s) => (
                      <span key={s} className="text-xs text-muted-foreground/70 bg-muted/60 rounded px-1.5 py-0.5">
                        {s}
                      </span>
                    ))}
                    {event.subcategory.length > 2 && (
                      <span className="text-xs text-muted-foreground/50">+{event.subcategory.length - 2}</span>
                    )}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">
                {event.group_name || "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(event.start_date)}</td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatTime(event.start_time)}</td>
              <td className="px-4 py-3">
                <Badge variant="secondary" className="whitespace-nowrap text-xs">
                  {event.event_type || "—"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    event.paid === "Free" ? "text-chart-4 font-medium text-sm" : "text-foreground font-medium text-sm"
                  }
                >
                  {event.paid || "—"}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                {event.participation || "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{event.event_city || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function getUniqueValues(events: Event[], field: keyof Event): string[] {
  const vals = new Set<string>()
  for (const e of events) {
    const v = e[field]
    if (typeof v === "string" && v) vals.add(v)
  }
  return Array.from(vals).sort()
}

export function UploadPage({
  onEventsChange,
  onOrganizationsChange,
}: {
  onEventsChange?: (events: Event[]) => void
  onOrganizationsChange?: (organizations: Organization[]) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadState, setUploadState] = useState<"idle" | "uploaded">("idle")
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [showTable, setShowTable] = useState(true)
  const [showWarnings, setShowWarnings] = useState(false)
  const [search, setSearch] = useState("")
  const [filterEventType, setFilterEventType] = useState("all")
  const [filterPaid, setFilterPaid] = useState("all")
  const [filterParticipation, setFilterParticipation] = useState("all")
  const [filterGroupType, setFilterGroupType] = useState("all")
  const [filterCity, setFilterCity] = useState("all")
  const [page, setPage] = useState(1)
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [pendingValidation, setPendingValidation] = useState<ValidationResult | null>(null)
  const [pendingParseResult, setPendingParseResult] = useState<ParseResult | null>(null)

  const events = parseResult ? parseResult.events : []

  const eventTypeOptions = getUniqueValues(events, "event_type")
  const paidOptions = getUniqueValues(events, "paid")
  const participationOptions = getUniqueValues(events, "participation")
  const groupTypeOptions = getUniqueValues(events, "group_type")
  const cityOptions = getUniqueValues(events, "event_city")

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return events.filter((e) => {
      if (q) {
        const match =
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.group_name.toLowerCase().includes(q) ||
          e.event_city.toLowerCase().includes(q) ||
          e.subcategory.some((s) => s.toLowerCase().includes(q))
        if (!match) return false
      }
      if (filterEventType !== "all" && e.event_type !== filterEventType) return false
      if (filterPaid !== "all" && e.paid !== filterPaid) return false
      if (filterParticipation !== "all" && e.participation !== filterParticipation) return false
      if (filterGroupType !== "all" && e.group_type !== filterGroupType) return false
      if (filterCity !== "all" && e.event_city !== filterCity) return false
      return true
    })
  }, [events, search, filterEventType, filterPaid, filterParticipation, filterGroupType, filterCity])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const resetFilters = () => {
    setSearch("")
    setFilterEventType("all")
    setFilterPaid("all")
    setFilterParticipation("all")
    setFilterGroupType("all")
    setFilterCity("all")
    setPage(1)
  }

  const hasActiveFilters =
    search || filterEventType !== "all" || filterPaid !== "all" || filterParticipation !== "all" || filterGroupType !== "all" || filterCity !== "all"

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
      const result = parseCSV(text)
      const validation = validateEventRows(result.rawRows)

      setPendingValidation(validation)
      setPendingParseResult(result)
      setValidationDialogOpen(true)
    }
    reader.readAsText(file)
  }

  const handleValidationConfirm = () => {
    if (!pendingParseResult || !pendingValidation) return
    const validSet = new Set(pendingValidation.validIndices)
    const filteredEvents = pendingParseResult.events.filter((_, i) => validSet.has(i))
    const filteredResult: ParseResult = {
      ...pendingParseResult,
      events: filteredEvents,
      skippedRows: pendingParseResult.events.length - filteredEvents.length,
    }
    setParseResult(filteredResult)
    onEventsChange?.(filteredResult.events)
    setUploadState("uploaded")
    setPage(1)
    setValidationDialogOpen(false)
    setPendingValidation(null)
    setPendingParseResult(null)
  }

  const handleValidationCancel = () => {
    setValidationDialogOpen(false)
    setPendingValidation(null)
    setPendingParseResult(null)
    setUploadedFileName("")
  }

  const handleClearEvents = () => {
    setUploadState("idle")
    setUploadedFileName("")
    setParseResult(null)
    setShowTable(true)
    setSearch("")
    setFilterEventType("all")
    setFilterPaid("all")
    setFilterParticipation("all")
    setFilterGroupType("all")
    setFilterCity("all")
    setPage(1)
    onEventsChange?.([])
  }

  const freeCount = events.filter((e) => e.paid === "Free").length
  const paidCount = events.filter((e) => e.paid === "Paid").length

  const datesSorted = events.map((e) => e.start_date).filter(Boolean).sort()
  const dateRangeText =
    datesSorted.length > 0
      ? `${formatDate(datesSorted[0])} – ${formatDate(datesSorted[datesSorted.length - 1])}`
      : "—"

  const warnings = parseResult?.warnings ?? []

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">CSV Upload</h1>
        <p className="mt-1.5 text-muted-foreground">
          Upload your weekly events file to begin matching against client profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">

          {uploadState === "uploaded" && (
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Table2 className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">Loaded Events</CardTitle>
                      <CardDescription className="mt-0.5">
                        {events.length} events parsed from CSV
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
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Search events, orgs, cities..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="pl-9 h-9"
                      />
                      {search && (
                        <button
                          onClick={() => { setSearch(""); setPage(1) }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <Select value={filterEventType} onValueChange={(v) => { setFilterEventType(v); setPage(1) }}>
                      <SelectTrigger className="h-9 w-[140px]">
                        <SelectValue placeholder="Event Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {eventTypeOptions.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterPaid} onValueChange={(v) => { setFilterPaid(v); setPage(1) }}>
                      <SelectTrigger className="h-9 w-[120px]">
                        <SelectValue placeholder="Cost" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Costs</SelectItem>
                        {paidOptions.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterParticipation} onValueChange={(v) => { setFilterParticipation(v); setPage(1) }}>
                      <SelectTrigger className="h-9 w-[130px]">
                        <SelectValue placeholder="Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Formats</SelectItem>
                        {participationOptions.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterGroupType} onValueChange={(v) => { setFilterGroupType(v); setPage(1) }}>
                      <SelectTrigger className="h-9 w-[150px]">
                        <SelectValue placeholder="Group Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Group Types</SelectItem>
                        {groupTypeOptions.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {cityOptions.length > 1 && (
                      <Select value={filterCity} onValueChange={(v) => { setFilterCity(v); setPage(1) }}>
                        <SelectTrigger className="h-9 w-[130px]">
                          <SelectValue placeholder="City" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Cities</SelectItem>
                          {cityOptions.map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 gap-1.5 text-muted-foreground">
                        <X className="h-3.5 w-3.5" />
                        Clear
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {filtered.length === events.length
                        ? `${events.length} events`
                        : `${filtered.length} of ${events.length} events`}
                    </span>
                    {filtered.length > PAGE_SIZE && (
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                    )}
                  </div>

                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Search className="h-8 w-8 mb-3 opacity-40" />
                      <p className="text-sm">No events match your filters.</p>
                      <Button variant="link" size="sm" onClick={resetFilters} className="mt-1 text-primary">
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <EventTable events={paginated} />
                  )}

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                          if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...")
                          acc.push(p)
                          return acc
                        }, [])
                        .map((p, idx) =>
                          p === "..." ? (
                            <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">...</span>
                          ) : (
                            <Button
                              key={p}
                              variant={p === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(p as number)}
                              className="h-8 w-8 p-0"
                            >
                              {p}
                            </Button>
                          )
                        )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Upload Events File</CardTitle>
                  <CardDescription>Supports CSV format.</CardDescription>
                </div>
                {uploadState === "uploaded" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearEvents}
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
                    : uploadState === "uploaded"
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

                {uploadState === "uploaded" ? (
                  <>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-chart-4/15">
                      <CheckCircle2 className="h-5 w-5 text-chart-4" />
                    </div>
                    <p className="font-semibold text-sm text-foreground">{uploadedFileName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {events.length} events loaded successfully
                    </p>
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
                onClick={downloadSampleEventCSV}
                className="w-full gap-2 text-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                Download Sample Events CSV
              </Button>
            </CardContent>
          </Card>

          {uploadState === "uploaded" && (
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-chart-4" />
                  <CardTitle className="text-base">Upload Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Events</span>
                  <span className="font-semibold text-foreground">{events.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date Range</span>
                  <span className="font-medium text-foreground text-right text-xs">{dateRangeText}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Free Events</span>
                  <span className="font-medium text-chart-4">{freeCount}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid Events</span>
                  <span className="font-medium text-foreground">{paidCount}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parse Warnings</span>
                  <span className={`font-medium ${warnings.length > 0 ? "text-chart-5" : "text-foreground"}`}>
                    {warnings.length}
                  </span>
                </div>
                {warnings.length > 0 && (
                  <>
                    <Separator />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowWarnings(!showWarnings)}
                      className="w-full justify-between text-chart-5 hover:text-chart-5 h-7 px-0"
                    >
                      <span className="text-xs">View warnings</span>
                      {showWarnings ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                    {showWarnings && (
                      <div className="space-y-2">
                        {warnings.map((w, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-md bg-chart-5/10 px-3 py-2">
                            <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-chart-5 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{w}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Expected CSV Columns</CardTitle>
              </div>
              <CardDescription>Use these exact lowercase column names in your CSV file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Primary — Used in AI Matching</p>
                <ul className="space-y-1.5">
                  {CSV_COLUMNS.slice(0, 9).map((col, i) => (
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
                  {CSV_COLUMNS.slice(9).map((col, i) => (
                    <li key={col} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium bg-muted text-muted-foreground">
                        {i + 10}
                      </span>
                      <code className="text-sm text-muted-foreground font-mono">{col}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All uploaded data is stored in memory for this session only. Closing or refreshing the tab clears everything automatically — no data is ever persisted between sessions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Upload Organizations List</h2>
          <p className="mt-1 text-muted-foreground">
            Upload your organizations list to enrich event matching and recommendations.
          </p>
        </div>
        <OrganizationUploadSection onOrganizationsChange={onOrganizationsChange} />
      </div>

      {pendingValidation && (
        <CsvValidationDialog
          open={validationDialogOpen}
          onOpenChange={setValidationDialogOpen}
          validation={pendingValidation}
          totalRows={pendingParseResult?.rawRows.length ?? 0}
          onUploadValid={handleValidationConfirm}
          onCancel={handleValidationCancel}
          label="events"
        />
      )}
    </div>
  )
}

import type { ClientProfile } from "@/types"
import type { AIRecommendation, OrgRecommendation } from "@/contexts/SessionContext"

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsvRows(headers: string[], rows: string[][]): string {
  const headerRow = headers.map(escapeCsvCell).join(",")
  const dataRows = rows.map((row) => row.map(escapeCsvCell).join(","))
  return [headerRow, ...dataRows].join("\r\n")
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.click()
  URL.revokeObjectURL(url)
}

function buildFilename(clientName: string, date: Date): string {
  const safeName = (clientName || "Client")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
  const month = date.toLocaleDateString("en-US", { month: "short" })
  const day = date.getDate()
  return `${safeName}-Recommendations-${month}${day}.csv`
}

export function downloadRecommendationsCSV(
  profile: ClientProfile,
  recommendations: AIRecommendation[],
  orgRecommendations: OrgRecommendation[]
) {
  const date = new Date()
  const filename = buildFilename(profile.name, date)

  const eventHeaders = ["Priority Rank", "Event Name", "Date", "Location", "Why Recommended"]
  const eventRows = recommendations.map((rec) => {
    const ev = rec.matched_event
    const dateStr = ev?.start_date
      ? new Date(ev.start_date + "T12:00:00").toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : ""
    const location = [ev?.event_city, ev?.start_time].filter(Boolean).join(" · ")
    return [
      String(rec.priority_rank),
      rec.event_name,
      dateStr,
      location,
      rec.why_this_event,
    ]
  })

  const orgHeaders = ["Priority Rank", "Organization Name", "Industry / Category", "Why Recommended"]
  const orgRows = orgRecommendations.map((rec) => [
    String(rec.priority_rank),
    rec.org_name,
    rec.category ?? "",
    rec.why_join,
  ])

  const sections: string[] = []

  if (recommendations.length > 0) {
    sections.push(`Recommended Events`)
    sections.push(buildCsvRows(eventHeaders, eventRows))
  }

  if (orgRecommendations.length > 0) {
    if (sections.length > 0) sections.push("")
    sections.push(`Recommended Organizations`)
    sections.push(buildCsvRows(orgHeaders, orgRows))
  }

  const content = sections.join("\r\n")
  triggerDownload(content, filename)
}

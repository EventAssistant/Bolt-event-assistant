import type { Event } from "@/types"

function parseEventDateTime(event: Event): { start: Date | null; end: Date | null } {
  if (!event.start_date) return { start: null, end: null }

  const datePart = event.start_date.trim()
  const timePart = event.start_time?.trim() || "09:00 AM"

  const parseTime = (t: string): { h: number; m: number } => {
    const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
    if (!match) return { h: 9, m: 0 }
    let h = parseInt(match[1], 10)
    const m = parseInt(match[2], 10)
    const meridiem = match[3]?.toUpperCase()
    if (meridiem === "PM" && h !== 12) h += 12
    if (meridiem === "AM" && h === 12) h = 0
    return { h, m }
  }

  const { h, m } = parseTime(timePart)

  const [year, month, day] = datePart.split("-").map(Number)
  const start = new Date(year, month - 1, day, h, m, 0)

  let end: Date
  if (event.end_date && event.end_time) {
    const [ey, em, ed] = event.end_date.split("-").map(Number)
    const { h: eh, m: em2 } = parseTime(event.end_time)
    end = new Date(ey, em - 1, ed, eh, em2, 0)
  } else {
    end = new Date(start.getTime() + 60 * 60 * 1000)
  }

  return { start, end }
}

function toCompactDatetime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  )
}

function toIsoDatetime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  )
}

export function buildGoogleCalendarUrl(event: Event): string {
  const { start, end } = parseEventDateTime(event)
  if (!start || !end) return ""

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${toCompactDatetime(start)}/${toCompactDatetime(end)}`,
    details: [event.description, event.website].filter(Boolean).join("\n\n"),
    location: [event.address, event.event_city, event.state].filter(Boolean).join(", "),
    ctz: "America/Chicago",
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}


function icsEscape(str: string): string {
  return (str ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

export function buildIcsContent(event: Event): string {
  const { start, end } = parseEventDateTime(event)
  if (!start || !end) return ""

  const now = toCompactDatetime(new Date())
  const uid = `event-${event.id || Date.now()}@networkmatch`

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NetworkMatch//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toCompactDatetime(start)}`,
    `DTEND:${toCompactDatetime(end)}`,
    `SUMMARY:${icsEscape(event.name)}`,
    `DESCRIPTION:${icsEscape([event.description, event.website].filter(Boolean).join("\\n\\n"))}`,
    `LOCATION:${icsEscape([event.address, event.event_city, event.state].filter(Boolean).join(", "))}`,
    event.website ? `URL:${event.website}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean)

  return lines.join("\r\n")
}

export function downloadIcs(event: Event, filename?: string): void {
  const content = buildIcsContent(event)
  if (!content) return
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename || `${event.name.replace(/[^a-z0-9]/gi, "_")}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

// DUAL CALENDAR SYSTEM — addevent for in-app, static links for email. Do not merge these.
function buildShortGoogleCalendarUrl(event: Event): string {
  const { start, end } = parseEventDateTime(event)
  if (!start || !end) return ""
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${toCompactDatetime(start)}/${toCompactDatetime(end)}`,
    location: [event.event_city, event.state].filter(Boolean).join(", "),
    ctz: "America/Chicago",
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function buildShortOutlookCalendarUrl(event: Event, office365 = false): string {
  const { start, end } = parseEventDateTime(event)
  if (!start || !end) return ""
  const base = office365
    ? "https://outlook.office.com/calendar/0/deeplink/compose"
    : "https://outlook.live.com/calendar/0/deeplink/compose"
  const params = new URLSearchParams({
    subject: event.name,
    startdt: toIsoDatetime(start),
    enddt: toIsoDatetime(end),
    location: [event.event_city, event.state].filter(Boolean).join(", "),
  })
  return `${base}?${params.toString()}`
}

function buildShortYahooCalendarUrl(event: Event): string {
  const { start, end } = parseEventDateTime(event)
  if (!start || !end) return ""
  const params = new URLSearchParams({
    v: "60",
    title: event.name,
    st: toCompactDatetime(start),
    et: toCompactDatetime(end),
    in_loc: [event.event_city, event.state].filter(Boolean).join(", "),
  })
  return `https://calendar.yahoo.com/?${params.toString()}`
}

export function generateEmailCalendarBlock(event: Event): string {
  if (!event.start_date) return ""

  const googleUrl = buildShortGoogleCalendarUrl(event)
  const outlookUrl = buildShortOutlookCalendarUrl(event, false)
  const o365Url = buildShortOutlookCalendarUrl(event, true)
  const yahooUrl = buildShortYahooCalendarUrl(event)

  const btnStyle = "display:inline-block;margin:4px 6px 4px 0;padding:8px 14px;text-decoration:none;border-radius:4px;font-size:13px;color:#ffffff;"

  return `<div style="margin:12px 0;"><p style="font-weight:bold;margin-bottom:6px;">Add to Your Calendar:</p>${googleUrl ? `<a href="${googleUrl}" target="_blank" style="${btnStyle}background:#4285F4;">Google Calendar</a>` : ""}${outlookUrl ? `<a href="${outlookUrl}" target="_blank" style="${btnStyle}background:#0078D4;">Outlook.com</a>` : ""}${o365Url ? `<a href="${o365Url}" target="_blank" style="${btnStyle}background:#D83B01;">Microsoft 365</a>` : ""}${yahooUrl ? `<a href="${yahooUrl}" target="_blank" style="${btnStyle}background:#6001D2;">Yahoo Calendar</a>` : ""}</div>`
}

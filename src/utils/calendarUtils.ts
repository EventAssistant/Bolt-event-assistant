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
    end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  }

  return { start, end }
}

function toGoogleDatetime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  )
}

function toIcsDatetime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  )
}

export function buildGoogleCalendarUrl(event: Event): string {
  const { start, end } = parseEventDateTime(event)
  if (!start || !end) return ""

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${toGoogleDatetime(start)}/${toGoogleDatetime(end)}`,
    details: [event.description, event.website].filter(Boolean).join("\n\n"),
    location: [event.address, event.event_city, event.state].filter(Boolean).join(", "),
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function icsEscape(str: string): string {
  return (str ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

export function buildIcsContent(event: Event): string {
  const { start, end } = parseEventDateTime(event)
  if (!start || !end) return ""

  const now = toIcsDatetime(new Date())
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
    `DTSTART:${toIcsDatetime(start)}`,
    `DTEND:${toIcsDatetime(end)}`,
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

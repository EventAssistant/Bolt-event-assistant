import type { Event } from "@/types"

declare global {
  interface Window {
    addeventatc?: {
      refresh: () => void
    }
  }
}

function formatAddeventDate(date: string, time: string): string {
  if (!date) return ""
  const [year, month, day] = date.split("-")
  const t = time || "00:00"
  return `${month}/${day}/${year} ${t}`
}

function addOneHour(dateStr: string, timeStr: string): string {
  if (!dateStr) return ""
  const [year, month, day] = dateStr.split("-").map(Number)
  const [h, m] = (timeStr || "00:00").split(":").map(Number)
  const d = new Date(year, month - 1, day, h, m + 60)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface AddToCalendarButtonProps {
  event: Event
  size?: "sm" | "default"
}

export function AddToCalendarButton({ event }: AddToCalendarButtonProps) {
  if (!event.start_date) return null

  const start = formatAddeventDate(event.start_date, event.start_time)
  const end =
    event.end_date || event.end_time
      ? formatAddeventDate(event.end_date || event.start_date, event.end_time || event.start_time)
      : addOneHour(event.start_date, event.start_time)
  const location = [event.address, event.event_city, event.state].filter(Boolean).join(", ")

  return (
    // CALENDAR INTEGRATION — uses addevent.com library. Do not replace with custom dropdown.
    <div
      title="Add to Calendar"
      className="addeventatc"
      style={{ display: "inline-block" }}
    >
      Add to Calendar
      <span className="start">{start}</span>
      <span className="end">{end}</span>
      <span className="timezone">America/Chicago</span>
      <span className="title">{event.name}</span>
      <span className="description">{event.description}</span>
      <span className="location">{location}</span>
    </div>
  )
}

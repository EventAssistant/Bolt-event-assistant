import type { Event } from "@/types"

interface AddToCalendarButtonProps {
  event: Event
  size?: "sm" | "default"
}

function formatAddeventDate(date: string, time: string): string {
  if (!date) return ""
  const [year, month, day] = date.split("-")
  const t = time || "00:00"
  return `${month}/${day}/${year} ${t}`
}

export function AddToCalendarButton({ event }: AddToCalendarButtonProps) {
  if (!event.start_date) return null

  const start = formatAddeventDate(event.start_date, event.start_time)
  const end = formatAddeventDate(event.end_date || event.start_date, event.end_time || event.start_time)
  const location = [event.address, event.event_city, event.state].filter(Boolean).join(", ")

  return (
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

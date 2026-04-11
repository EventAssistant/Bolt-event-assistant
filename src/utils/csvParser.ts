import type { Event, ParseResult, Organization, OrgParseResult } from "@/types"

const COLUMN_ALIASES: Record<string, keyof Event> = {
  id: "id",
  name: "name",
  "event name": "name",
  event_name: "name",
  eventname: "name",
  title: "name",
  "start date": "start_date",
  startdate: "start_date",
  start_date: "start_date",
  date: "start_date",
  "start time": "start_time",
  starttime: "start_time",
  start_time: "start_time",
  time: "start_time",
  "end date": "end_date",
  enddate: "end_date",
  end_date: "end_date",
  "end time": "end_time",
  endtime: "end_time",
  end_time: "end_time",
  website: "website",
  url: "website",
  link: "website",
  "event url": "website",
  eventurl: "website",
  event_url: "website",
  description: "description",
  "event description": "description",
  event_description: "description",
  "city calendar": "city_calendar",
  citycalendar: "city_calendar",
  city_calendar: "city_calendar",
  calendar: "city_calendar",
  "event type": "event_type",
  eventtype: "event_type",
  event_type: "event_type",
  type: "event_type",
  paid: "paid",
  cost: "paid",
  price: "paid",
  address: "address",
  location: "address",
  "event city": "event_city",
  eventcity: "event_city",
  event_city: "event_city",
  city: "event_city",
  state: "state",
  zipcode: "zipcode",
  zip: "zipcode",
  "zip code": "zipcode",
  zip_code: "zipcode",
  "group name": "group_name",
  groupname: "group_name",
  group_name: "group_name",
  organization: "group_name",
  "organization name": "group_name",
  organization_name: "group_name",
  organizer: "group_name",
  audience: "group_type",
  source: "source",
  notes: "notes",
  note: "notes",
  "group id": "group_id",
  groupid: "group_id",
  group_id: "group_id",
  "group type": "group_type",
  grouptype: "group_type",
  group_type: "group_type",
  participation: "participation",
  format: "participation",
  "internal type": "internal_type",
  internaltype: "internal_type",
  internal_type: "internal_type",
  status: "internal_type",
  "part of town": "part_of_town",
  partoftown: "part_of_town",
  part_of_town: "part_of_town",
  neighborhood: "part_of_town",
  subcategory: "subcategory",
  subcategories: "subcategory",
  category: "subcategory",
  categories: "subcategory",
  "created at": "created_at",
  createdat: "created_at",
  created_at: "created_at",
  "updated at": "updated_at",
  updatedat: "updated_at",
  updated_at: "updated_at",
}

function parseCSVText(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const ch = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"'
        i += 2
        continue
      } else if (ch === '"') {
        inQuotes = false
        i++
        continue
      } else {
        field += ch
        i++
        continue
      }
    }

    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }

    if (ch === ',') {
      row.push(field.trim())
      field = ""
      i++
      continue
    }

    if (ch === '\r' && next === '\n') {
      row.push(field.trim())
      rows.push(row)
      row = []
      field = ""
      i += 2
      continue
    }

    if (ch === '\n' || ch === '\r') {
      row.push(field.trim())
      rows.push(row)
      row = []
      field = ""
      i++
      continue
    }

    field += ch
    i++
  }

  if (field || row.length > 0) {
    row.push(field.trim())
    rows.push(row)
  }

  return rows
}

function normalizeDate(raw: string): string {
  if (!raw || raw === "-" || raw.toLowerCase().includes("invalid")) return ""
  const d = new Date(raw)
  if (isNaN(d.getTime())) return ""
  return d.toISOString().split("T")[0]
}

function normalizeTime(raw: string): string {
  if (!raw || raw === "-") return ""
  const match = raw.match(/(\d{1,2}):(\d{2})/)
  if (!match) return ""
  const h = parseInt(match[1], 10)
  const m = match[2]
  const period = raw.toUpperCase().includes("PM") ? "PM" : raw.toUpperCase().includes("AM") ? "AM" : null
  if (period) {
    const h12 = period === "PM" && h !== 12 ? h + 12 : period === "AM" && h === 12 ? 0 : h
    return `${String(h12).padStart(2, "0")}:${m}`
  }
  return `${String(h).padStart(2, "0")}:${m}`
}

function normalizePaid(raw: string): string {
  if (!raw || raw === "-") return ""
  const lower = raw.toLowerCase()
  if (lower === "false" || lower === "0" || lower === "free" || lower === "no") return "Free"
  if (lower === "true" || lower === "1" || lower === "paid" || lower === "yes") return "Paid"
  return raw
}

function normalizeEmpty(raw: string): string {
  if (!raw || raw === "-") return ""
  return raw
}

function parseSubcategory(raw: string): string[] {
  if (!raw || raw === "-") return []
  const trimmed = raw.trim()
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
    } catch {
      // fall through
    }
  }
  return trimmed
    .split(",")
    .map((s) => s.replace(/[[\]"]/g, "").trim())
    .filter(Boolean)
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function parseCSV(csvText: string): ParseResult {
  const rows = parseCSVText(csvText)
  if (rows.length < 2) {
    return { events: [], warnings: ["CSV file appears to be empty or has no data rows."], totalRows: 0, skippedRows: 0, rawRows: [] }
  }

  const headerRow = rows[0]
  const columnMap: Record<number, keyof Event> = {}

  for (let col = 0; col < headerRow.length; col++) {
    const header = headerRow[col].toLowerCase().replace(/[^a-z0-9 ]/g, "").trim()
    const mapped = COLUMN_ALIASES[header]
    if (mapped) {
      columnMap[col] = mapped
    }
  }

  const warnings: string[] = []
  const events: Event[] = []
  const rawRows: Array<Record<string, string>> = []
  const seenIds = new Set<string>()
  let skippedRows = 0
  const dataRows = rows.slice(1).filter((r) => r.some((cell) => cell.trim() !== ""))

  for (let rowIdx = 0; rowIdx < dataRows.length; rowIdx++) {
    const row = dataRows[rowIdx]
    const raw: Partial<Record<keyof Event, string>> = {}

    for (let col = 0; col < row.length; col++) {
      const field = columnMap[col]
      if (field) {
        raw[field] = row[col]
      }
    }

    rawRows.push(raw as Record<string, string>)

    const id = normalizeEmpty(raw.id ?? "") || String(rowIdx + 1)

    if (seenIds.has(id)) {
      warnings.push(`Row ${rowIdx + 2}: Duplicate ID "${id}" skipped.`)
      skippedRows++
      continue
    }
    seenIds.add(id)

    const website = normalizeEmpty(raw.website ?? "")
    if (website && !isValidUrl(website)) {
      warnings.push(`Row ${rowIdx + 2}: Invalid URL "${website}" for event "${raw.name ?? ""}"`)
    }

    const start_date = normalizeDate(raw.start_date ?? "")
    const end_date = normalizeDate(raw.end_date ?? "")

    if ((raw.start_date ?? "") && !start_date) {
      warnings.push(`Row ${rowIdx + 2}: Could not parse start date "${raw.start_date}" for event "${raw.name ?? ""}"`)
    }

    const event: Event = {
      id,
      name: normalizeEmpty(raw.name ?? ""),
      start_date,
      start_time: normalizeTime(raw.start_time ?? ""),
      address: normalizeEmpty(raw.address ?? ""),
      event_type: normalizeEmpty(raw.event_type ?? ""),
      group_type: normalizeEmpty(raw.group_type ?? ""),
      paid: normalizePaid(raw.paid ?? ""),
      description: normalizeEmpty(raw.description ?? ""),
      website,
      end_date,
      end_time: normalizeTime(raw.end_time ?? ""),
      city_calendar: normalizeEmpty(raw.city_calendar ?? ""),
      event_city: normalizeEmpty(raw.event_city ?? ""),
      state: normalizeEmpty(raw.state ?? ""),
      zipcode: normalizeEmpty(raw.zipcode ?? ""),
      group_name: normalizeEmpty(raw.group_name ?? ""),
      source: normalizeEmpty(raw.source ?? ""),
      notes: normalizeEmpty(raw.notes ?? ""),
      group_id: normalizeEmpty(raw.group_id ?? ""),
      participation: normalizeEmpty(raw.participation ?? ""),
      internal_type: normalizeEmpty(raw.internal_type ?? ""),
      part_of_town: normalizeEmpty(raw.part_of_town ?? ""),
      subcategory: parseSubcategory(raw.subcategory ?? ""),
      created_at: normalizeEmpty(raw.created_at ?? ""),
      updated_at: normalizeEmpty(raw.updated_at ?? ""),
    }

    events.push(event)
  }

  return {
    events,
    warnings,
    totalRows: dataRows.length,
    skippedRows,
    rawRows,
  }
}

const ORG_COLUMN_ALIASES: Record<string, keyof Organization> = {
  name: "name",
  org_name: "name",
  "org name": "name",
  orgname: "name",
  organization: "name",
  "organization name": "name",
  city: "city",
  category: "category",
  org_type: "category",
  "org type": "category",
  orgtype: "category",
  industry: "category",
  type: "category",
  "home page": "home_page",
  homepage: "home_page",
  home_page: "home_page",
  org_url: "home_page",
  orgurl: "home_page",
  "org url": "home_page",
  url: "home_page",
  website: "home_page",
  link: "home_page",
  description: "description",
  "zip code": "zip_code",
  zipcode: "zip_code",
  zip_code: "zip_code",
  zip: "zip_code",
  address: "address",
  location: "address",
  calendar: "calendar",
  "internal type": "internal_type",
  internaltype: "internal_type",
  internal_type: "internal_type",
  membership_type: "internal_type",
  "membership type": "internal_type",
  membershiptype: "internal_type",
  activity: "activity",
  typical_attendees: "notes",
  "typical attendees": "notes",
  typicalattendees: "notes",
  attendees: "notes",
  status: "status",
  notes: "notes",
  note: "notes",
}

export function parseOrganizationsCSV(csvText: string): OrgParseResult {
  const rows = parseCSVText(csvText)
  if (rows.length < 2) {
    return { organizations: [], warnings: ["CSV file appears to be empty or has no data rows."], totalRows: 0, skippedRows: 0, rawRows: [] }
  }

  const headerRow = rows[0]
  const columnMap: Record<number, keyof Organization> = {}

  for (let col = 0; col < headerRow.length; col++) {
    const header = headerRow[col].toLowerCase().replace(/[^a-z0-9 _]/g, "").trim()
    const mapped = ORG_COLUMN_ALIASES[header]
    if (mapped) {
      columnMap[col] = mapped
    }
  }

  const warnings: string[] = []
  const organizations: Organization[] = []
  const rawRows: Array<Record<string, string>> = []
  let skippedRows = 0
  const dataRows = rows.slice(1).filter((r) => r.some((cell) => cell.trim() !== ""))

  for (let rowIdx = 0; rowIdx < dataRows.length; rowIdx++) {
    const row = dataRows[rowIdx]
    const raw: Partial<Record<keyof Organization, string>> = {}

    for (let col = 0; col < row.length; col++) {
      const field = columnMap[col]
      if (field) {
        raw[field] = row[col]
      }
    }

    rawRows.push(raw as Record<string, string>)

    if (!raw.name?.trim()) {
      warnings.push(`Row ${rowIdx + 2}: Missing name, skipped.`)
      skippedRows++
      continue
    }

    organizations.push({
      name: normalizeEmpty(raw.name ?? ""),
      category: normalizeEmpty(raw.category ?? ""),
      city: normalizeEmpty(raw.city ?? ""),
      description: normalizeEmpty(raw.description ?? ""),
      home_page: normalizeEmpty(raw.home_page ?? ""),
      internal_type: normalizeEmpty(raw.internal_type ?? ""),
      notes: normalizeEmpty(raw.notes ?? ""),
      zip_code: normalizeEmpty(raw.zip_code ?? ""),
      address: normalizeEmpty(raw.address ?? ""),
      calendar: normalizeEmpty(raw.calendar ?? ""),
      activity: normalizeEmpty(raw.activity ?? ""),
      status: normalizeEmpty(raw.status ?? ""),
    })
  }

  return {
    organizations,
    warnings,
    totalRows: dataRows.length,
    skippedRows,
    rawRows,
  }
}

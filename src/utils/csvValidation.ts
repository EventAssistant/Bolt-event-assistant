import { z } from "zod"

function isRecognizableDate(val: string): boolean {
  if (!val || val === "-") return false
  const d = new Date(val)
  if (!isNaN(d.getTime())) return true
  const patterns = [
    /^\d{4}-\d{1,2}-\d{1,2}$/,
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
    /^\d{1,2}-\d{1,2}-\d{2,4}$/,
    /^[A-Za-z]+ \d{1,2},? \d{4}$/,
  ]
  return patterns.some((p) => p.test(val.trim()))
}

const eventRowSchema = z.object({
  name: z.string().min(1, "Missing event name"),
  start_date: z.string().refine(isRecognizableDate, "Missing or unrecognizable date"),
  address: z.string().min(1, "Missing location/venue"),
  description: z.string().optional(),
  event_type: z.string().optional(),
})

const orgRowSchema = z.object({
  name: z.string().min(1, "Missing organization name"),
  category: z.string().min(1, "Missing industry/category"),
  description: z.string().optional(),
  notes: z.string().optional(),
})

export interface RowIssue {
  row: number
  errors: string[]
  warnings: string[]
}

export interface ValidationResult {
  validCount: number
  issueCount: number
  issues: RowIssue[]
  validIndices: number[]
}

export function validateEventRows(
  rows: Array<Record<string, string>>,
): ValidationResult {
  const issues: RowIssue[] = []
  const validIndices: number[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const csvRow = i + 2
    const result = eventRowSchema.safeParse(row)
    const rowWarnings: string[] = []

    if (!row.description?.trim() && !row.event_type?.trim()) {
      rowWarnings.push("Missing description and category")
    }

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message)
      issues.push({ row: csvRow, errors, warnings: rowWarnings })
    } else if (rowWarnings.length > 0) {
      issues.push({ row: csvRow, errors: [], warnings: rowWarnings })
      validIndices.push(i)
    } else {
      validIndices.push(i)
    }
  }

  return {
    validCount: validIndices.length,
    issueCount: issues.filter((i) => i.errors.length > 0).length,
    issues,
    validIndices,
  }
}

export function validateOrgRows(
  rows: Array<Record<string, string>>,
): ValidationResult {
  const issues: RowIssue[] = []
  const validIndices: number[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const csvRow = i + 2
    const result = orgRowSchema.safeParse(row)
    const rowWarnings: string[] = []

    if (!row.description?.trim() && !row.notes?.trim()) {
      rowWarnings.push("Missing description and contact info")
    }

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message)
      issues.push({ row: csvRow, errors, warnings: rowWarnings })
    } else if (rowWarnings.length > 0) {
      issues.push({ row: csvRow, errors: [], warnings: rowWarnings })
      validIndices.push(i)
    } else {
      validIndices.push(i)
    }
  }

  return {
    validCount: validIndices.length,
    issueCount: issues.filter((i) => i.errors.length > 0).length,
    issues,
    validIndices,
  }
}

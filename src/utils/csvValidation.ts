import { z } from "zod"

const nonEmpty = z.string().min(1)

const eventRowSchema = z.object({
  name: nonEmpty,
}).passthrough()

const orgRowSchema = z.object({
  name: nonEmpty,
}).passthrough()

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

function isRowEmpty(row: Record<string, string>): boolean {
  return Object.values(row).every((v) => !v || !v.trim())
}

function columnExistsInAnyRow(rows: Array<Record<string, string>>, key: string): boolean {
  return rows.some((row) => key in row)
}

export function validateEventRows(
  rows: Array<Record<string, string>>,
): ValidationResult {
  const issues: RowIssue[] = []
  const validIndices: number[] = []

  if (rows.length > 0) {
    console.log("[CSV Validation] First parsed event row keys:", Object.keys(rows[0]))
    console.log("[CSV Validation] First parsed event row:", rows[0])
  }

  const hasDescriptionCol = columnExistsInAnyRow(rows, "description")
  const hasEventTypeCol = columnExistsInAnyRow(rows, "event_type")

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const csvRow = i + 2

    if (isRowEmpty(row)) {
      issues.push({ row: csvRow, errors: ["Empty row"], warnings: [] })
      continue
    }

    const result = eventRowSchema.safeParse(row)
    const rowWarnings: string[] = []

    if (hasDescriptionCol && !row.description?.trim() && hasEventTypeCol && !row.event_type?.trim()) {
      rowWarnings.push("Missing description and category")
    } else if (hasDescriptionCol && !row.description?.trim()) {
      rowWarnings.push("Missing description")
    } else if (hasEventTypeCol && !row.event_type?.trim()) {
      rowWarnings.push("Missing category")
    }

    if (!result.success) {
      issues.push({ row: csvRow, errors: ["Missing event name"], warnings: rowWarnings })
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

  if (rows.length > 0) {
    console.log("[CSV Validation] First parsed org row keys:", Object.keys(rows[0]))
    console.log("[CSV Validation] First parsed org row:", rows[0])
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const csvRow = i + 2

    if (isRowEmpty(row)) {
      issues.push({ row: csvRow, errors: ["Empty row"], warnings: [] })
      continue
    }

    const result = orgRowSchema.safeParse(row)

    if (!result.success) {
      issues.push({ row: csvRow, errors: ["Missing organization name"], warnings: [] })
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

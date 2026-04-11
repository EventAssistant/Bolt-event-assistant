import {
  CircleCheck as CheckCircle2,
  CircleAlert as AlertCircle,
  TriangleAlert,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ValidationResult } from "@/utils/csvValidation"

interface CsvValidationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  validation: ValidationResult
  totalRows: number
  onUploadValid: () => void
  onCancel: () => void
  label: string
}

export function CsvValidationDialog({
  open,
  onOpenChange,
  validation,
  totalRows,
  onUploadValid,
  onCancel,
  label,
}: CsvValidationDialogProps) {
  const allValid = validation.issueCount === 0
  const errorIssues = validation.issues.filter((i) => i.errors.length > 0)
  const warningOnlyIssues = validation.issues.filter(
    (i) => i.errors.length === 0 && i.warnings.length > 0,
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          {allValid ? (
            <>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-chart-4/15">
                <CheckCircle2 className="h-6 w-6 text-chart-4" />
              </div>
              <AlertDialogTitle className="text-center">
                All {totalRows} rows validated
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                {warningOnlyIssues.length > 0
                  ? `Uploading ${label}... ${warningOnlyIssues.length} row${warningOnlyIssues.length === 1 ? " has" : "s have"} minor warnings.`
                  : `Uploading ${label}...`}
              </AlertDialogDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-chart-5/15">
                <AlertCircle className="h-6 w-6 text-chart-5" />
              </div>
              <AlertDialogTitle className="text-center">
                {validation.validCount} rows valid, {validation.issueCount}{" "}
                {validation.issueCount === 1 ? "row has" : "rows have"} issues
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Review the issues below. You can upload only the valid rows or
                cancel and fix the file.
              </AlertDialogDescription>
            </>
          )}
        </AlertDialogHeader>

        {(errorIssues.length > 0 || warningOnlyIssues.length > 0) && (
          <ScrollArea className="max-h-[240px] rounded-lg border border-border">
            <div className="divide-y divide-border">
              {errorIssues.map((issue) => (
                <div
                  key={issue.row}
                  className="flex items-start gap-3 px-4 py-2.5"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                  <div className="min-w-0 text-sm">
                    <span className="font-medium text-foreground">
                      Row {issue.row}:
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {issue.errors.join(" | ")}
                    </span>
                  </div>
                </div>
              ))}
              {warningOnlyIssues.map((issue) => (
                <div
                  key={issue.row}
                  className="flex items-start gap-3 px-4 py-2.5"
                >
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chart-5" />
                  <div className="min-w-0 text-sm">
                    <span className="font-medium text-foreground">
                      Row {issue.row}:
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {issue.warnings.join(" | ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <AlertDialogFooter>
          {allValid ? (
            <AlertDialogAction onClick={onUploadValid}>
              Continue
            </AlertDialogAction>
          ) : (
            <>
              <AlertDialogCancel onClick={onCancel}>
                Cancel and fix the file
              </AlertDialogCancel>
              <AlertDialogAction onClick={onUploadValid}>
                Upload valid rows only ({validation.validCount})
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

import { useState, useEffect } from "react"
import { RotateCcw, Save, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"

const DEFAULT_INSTRUCTIONS =
  "You are an expert networking event matcher. Match clients to events and organizations based on their ideal networking targets, industries, and company size preferences. Prioritize quality of match over quantity."

export function MatchingInstructionsTab() {
  const [instructions, setInstructions] = useState("")
  const [savedInstructions, setSavedInstructions] = useState("")
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadInstructions()
  }, [])

  async function loadInstructions() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("matching_config")
        .select("value, updated_at")
        .eq("key", "matching_instructions")
        .maybeSingle()

      if (error) throw error

      const value = data?.value ?? DEFAULT_INSTRUCTIONS
      setInstructions(value)
      setSavedInstructions(value)
      setUpdatedAt(data?.updated_at ?? null)
    } catch {
      setInstructions(DEFAULT_INSTRUCTIONS)
      setSavedInstructions(DEFAULT_INSTRUCTIONS)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from("matching_config")
        .upsert(
          { key: "matching_instructions", value: instructions, updated_at: now },
          { onConflict: "key" }
        )

      if (error) throw error

      setSavedInstructions(instructions)
      setUpdatedAt(now)
      toast.success("Matching instructions saved successfully.")
    } catch {
      toast.error("Failed to save instructions. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setInstructions(DEFAULT_INSTRUCTIONS)
  }

  const hasChanges = instructions !== savedInstructions

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Brain className="h-4 w-4 animate-pulse" />
          Loading instructions...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
        These instructions are prepended to every Claude matching run as a system directive. Customize them to
        add domain knowledge, city-specific context, or matching preferences to improve results over time.
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="matching-instructions" className="text-sm font-medium">
          Matching Instructions
        </Label>
        <Textarea
          id="matching-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Enter your matching instructions..."
          className="min-h-40 resize-none font-mono text-sm bg-muted/30 leading-relaxed"
          rows={8}
        />
        <p className="text-xs text-muted-foreground leading-relaxed">
          These instructions are sent to Claude before every matching run. Add domain knowledge,
          city-specific context, or matching preferences here to improve results over time.
        </p>
        {updatedAt && (
          <p className="text-xs text-muted-foreground">
            Last updated:{" "}
            <span className="font-medium text-foreground">
              {format(new Date(updatedAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to Default
        </Button>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="gap-1.5 min-w-[130px]"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save Instructions"}
        </Button>
      </div>
    </div>
  )
}

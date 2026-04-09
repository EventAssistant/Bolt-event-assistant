import { useState } from "react"
import { Pencil, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SubmittedProfileRow } from "@/lib/supabase"

const COMPANY_SIZE_OPTIONS = ["Solopreneur", "2-10", "11-50", "51-200", "201-500", "500+"]
const REVENUE_RANGE_OPTIONS = ["Under $500K", "$500K-$2M", "$2M-$10M", "$10M-$50M", "$50M+"]

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
  badgeClassName,
}: {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
  placeholder: string
  badgeClassName?: string
}) {
  const [input, setInput] = useState("")

  const handleAdd = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed)
      setInput("")
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className={`gap-1 pl-2 pr-1 py-0.5 text-xs ${badgeClassName ?? ""}`}
          >
            {tag}
            <button
              onClick={() => onRemove(tag)}
              className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {tags.length === 0 && (
          <span className="text-xs text-muted-foreground/50 pt-1">None added</span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          placeholder={placeholder}
          className="h-8 bg-muted/30 text-sm"
        />
        <Button size="sm" variant="outline" onClick={handleAdd} className="h-8 px-2 shrink-0">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

function ChipSelector({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ${
              isActive
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/8 hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

interface EditProfileModalProps {
  profile: SubmittedProfileRow
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updated: SubmittedProfileRow) => void
}

export function EditProfileModal({ profile, open, onOpenChange, onSave }: EditProfileModalProps) {
  const [form, setForm] = useState<SubmittedProfileRow>({ ...profile })

  const resetAndOpen = (val: boolean) => {
    if (val) setForm({ ...profile })
    onOpenChange(val)
  }

  const update = (patch: Partial<SubmittedProfileRow>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const handleSave = () => {
    onSave(form)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={resetAndOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            Edit Profile — {profile.name || "Unnamed"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 py-5 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Basic Information
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Full Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="e.g. Sarah Mitchell"
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Job Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => update({ title: e.target.value })}
                    placeholder="e.g. Senior Consultant"
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Industry</Label>
                  <Input
                    value={form.industry}
                    onChange={(e) => update({ industry: e.target.value })}
                    placeholder="e.g. Management Consulting"
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Geographic Area</Label>
                  <Input
                    value={form.geographic_area}
                    onChange={(e) => update({ geographic_area: e.target.value })}
                    placeholder="e.g. Austin, TX"
                    className="bg-muted/30"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Target Prospect Description</Label>
              <Textarea
                value={form.target_prospect_description}
                onChange={(e) => update({ target_prospect_description: e.target.value })}
                rows={3}
                placeholder="Describe the ideal prospect this person wants to meet..."
                className="resize-none bg-muted/30 text-sm"
              />
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Target Roles &amp; Industries
              </p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Target Roles</Label>
                  <TagInput
                    tags={form.target_roles}
                    onAdd={(tag) => update({ target_roles: [...form.target_roles, tag] })}
                    onRemove={(tag) => update({ target_roles: form.target_roles.filter((r) => r !== tag) })}
                    placeholder="Add a role..."
                    badgeClassName="bg-primary/15 text-primary border-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Target Industries</Label>
                  <TagInput
                    tags={form.target_industries}
                    onAdd={(tag) => update({ target_industries: [...form.target_industries, tag] })}
                    onRemove={(tag) => update({ target_industries: form.target_industries.filter((i) => i !== tag) })}
                    placeholder="Add an industry..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Professional Associations</Label>
                  <TagInput
                    tags={form.professional_associations}
                    onAdd={(tag) => update({ professional_associations: [...form.professional_associations, tag] })}
                    onRemove={(tag) => update({ professional_associations: form.professional_associations.filter((a) => a !== tag) })}
                    placeholder="Add an association..."
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Company Profile
              </p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Company Size</Label>
                  <ChipSelector
                    options={COMPANY_SIZE_OPTIONS}
                    selected={form.company_sizes}
                    onToggle={(val) => {
                      const updated = form.company_sizes.includes(val)
                        ? form.company_sizes.filter((s) => s !== val)
                        : [...form.company_sizes, val]
                      update({ company_sizes: updated })
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Revenue Range</Label>
                  <ChipSelector
                    options={REVENUE_RANGE_OPTIONS}
                    selected={form.revenue_ranges}
                    onToggle={(val) => {
                      const updated = form.revenue_ranges.includes(val)
                        ? form.revenue_ranges.filter((r) => r !== val)
                        : [...form.revenue_ranges, val]
                      update({ revenue_ranges: updated })
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Pain Points
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-muted-foreground">Pain Point 1</Label>
                  <Input
                    value={form.pain_point_1}
                    onChange={(e) => update({ pain_point_1: e.target.value })}
                    placeholder="Primary challenge..."
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-muted-foreground">Pain Point 2</Label>
                  <Input
                    value={form.pain_point_2}
                    onChange={(e) => update({ pain_point_2: e.target.value })}
                    placeholder="Secondary challenge..."
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-muted-foreground">Pain Point 3</Label>
                  <Input
                    value={form.pain_point_3}
                    onChange={(e) => update({ pain_point_3: e.target.value })}
                    placeholder="Third challenge..."
                    className="bg-muted/30"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Decision Drivers &amp; Success Metrics
              </p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Decision Drivers</Label>
                  <TagInput
                    tags={form.decision_drivers}
                    onAdd={(tag) => update({ decision_drivers: [...form.decision_drivers, tag] })}
                    onRemove={(tag) => update({ decision_drivers: form.decision_drivers.filter((d) => d !== tag) })}
                    placeholder="Add a driver..."
                  />
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-muted-foreground">Success Metric 1</Label>
                    <Input
                      value={form.success_metric_1}
                      onChange={(e) => update({ success_metric_1: e.target.value })}
                      placeholder="e.g. 15% cost reduction in 12 months"
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-muted-foreground">Success Metric 2</Label>
                    <Input
                      value={form.success_metric_2}
                      onChange={(e) => update({ success_metric_2: e.target.value })}
                      placeholder="e.g. Faster close cycle by 30%"
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-muted-foreground">Success Metric 3</Label>
                    <Input
                      value={form.success_metric_3}
                      onChange={(e) => update({ success_metric_3: e.target.value })}
                      placeholder="Optional third metric..."
                      className="bg-muted/30"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-1.5">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

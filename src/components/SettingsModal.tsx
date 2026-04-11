import { useState } from "react"
import { Settings, ExternalLink, CircleCheck as CheckCircle2, Brain, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEmailSettings } from "@/contexts/EmailSettingsContext"
import { MatchingInstructionsTab } from "@/components/MatchingInstructionsTab"

interface SettingsModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultTab?: string
}

export function SettingsModal({ open: controlledOpen, onOpenChange, defaultTab = "email" }: SettingsModalProps = {}) {
  const { settings, updateSettings, isConfigured } = useEmailSettings()
  const [internalOpen, setInternalOpen] = useState(false)
  const [form, setForm] = useState(settings)
  const [saved, setSaved] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val)
    else setInternalOpen(val)
  }

  const handleOpen = (val: boolean) => {
    if (val) setForm(settings)
    setOpen(val)
    setSaved(false)
  }

  const handleSave = async () => {
    await updateSettings(form)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setOpen(false)
    }, 1200)
  }

  const hasChanges =
    form.publicKey !== settings.publicKey ||
    form.serviceId !== settings.serviceId ||
    form.templateId !== settings.templateId ||
    form.senderName !== settings.senderName

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8 px-2">
            <Settings className="h-3.5 w-3.5" />
            <span className="text-xs">Settings</span>
            {isConfigured && (
              <CheckCircle2 className="h-3 w-3 text-chart-4" />
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure email delivery and AI matching behavior for your account.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="email" className="flex-1 gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email Settings
              {isConfigured && <CheckCircle2 className="h-3 w-3 text-chart-4" />}
            </TabsTrigger>
            <TabsTrigger value="matching" className="flex-1 gap-1.5">
              <Brain className="h-3.5 w-3.5" />
              Matching Intelligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
              Don't have an EmailJS account?{" "}
              <a
                href="https://www.emailjs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                Create one at emailjs.com
                <ExternalLink className="h-3 w-3" />
              </a>
              {" "}— it's free for up to 200 emails/month. After creating your account, set up a service and template, then paste the credentials below.
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="publicKey" className="text-sm font-medium">
                  Public Key
                </Label>
                <Input
                  id="publicKey"
                  value={form.publicKey}
                  onChange={(e) => setForm({ ...form, publicKey: e.target.value })}
                  placeholder="e.g. YOUR_PUBLIC_KEY"
                  className="font-mono text-sm bg-muted/30"
                />
                <p className="text-xs text-muted-foreground">
                  Found in EmailJS Dashboard → Account → API Keys
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceId" className="text-sm font-medium">
                  Service ID
                </Label>
                <Input
                  id="serviceId"
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  placeholder="e.g. service_xxxxxxx"
                  className="font-mono text-sm bg-muted/30"
                />
                <p className="text-xs text-muted-foreground">
                  Found in EmailJS Dashboard → Email Services
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateId" className="text-sm font-medium">
                  Template ID
                </Label>
                <Input
                  id="templateId"
                  value={form.templateId}
                  onChange={(e) => setForm({ ...form, templateId: e.target.value })}
                  placeholder="e.g. template_xxxxxxx"
                  className="font-mono text-sm bg-muted/30"
                />
                <p className="text-xs text-muted-foreground">
                  Found in EmailJS Dashboard → Email Templates. Template must accept:{" "}
                  <code className="text-xs bg-muted px-1 rounded">to_email</code>,{" "}
                  <code className="text-xs bg-muted px-1 rounded">client_name</code>,{" "}
                  <code className="text-xs bg-muted px-1 rounded">report_content</code>,{" "}
                  <code className="text-xs bg-muted px-1 rounded">sender_name</code>
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="senderName" className="text-sm font-medium">
                  Your Name <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="senderName"
                  value={form.senderName}
                  onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                  placeholder="e.g. Alex Johnson"
                  className="bg-muted/30"
                />
                <p className="text-xs text-muted-foreground">
                  Included as <code className="text-xs bg-muted px-1 rounded">sender_name</code> in the template
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges && !saved}
                className="gap-1.5 min-w-[80px]"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Saved
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="matching" className="mt-4">
            <MatchingInstructionsTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  Upload,
  CircleUser as UserCircle,
  Sparkles,
  Inbox,
  LogOut,
  Building2,
  Trash2,
  CircleCheck,
  ShieldAlert,
  Settings,
  CalendarDays,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useSession } from "@/contexts/SessionContext"
import { Button } from "@/components/ui/button"
import { EmailSettingsModal } from "@/components/EmailSettingsModal"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { path: "/upload", label: "CSV Upload", icon: Upload },
  { path: "/profile", label: "Client Profile", icon: UserCircle },
  { path: "/recommendations", label: "Recommendations", icon: Sparkles },
  { path: "/submissions", label: "Submitted Profiles", icon: Inbox },
]

function formatNavTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function getUserDisplayName(email: string): string {
  return email.split("@")[0]
}

export function NavBar() {
  const { user, signOut } = useAuth()
  const { events, organizations, eventsUploadedAt, orgsUploadedAt, clearAll } = useSession()
  const eventsCount = events.length
  const organizationsCount = organizations.length
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [emailSettingsOpen, setEmailSettingsOpen] = useState(false)

  const hasData = eventsCount > 0 || organizationsCount > 0

  const uploadTimestamp = eventsUploadedAt || orgsUploadedAt

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      navigate("/login")
    } catch (error) {
      console.error("Failed to sign out:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleClearAll = async () => {
    setClearDialogOpen(false)
    clearAll()
    navigate("/upload")
    await Promise.all([
      supabase
        .from("submitted_profiles")
        .update({ last_report_sent_at: null })
        .neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase
        .from("recommendation_cache")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"),
    ])
    toast.success("All event data cleared. Ready for next week's upload.", {
      icon: <CircleCheck className="h-4 w-4 text-green-600" />,
      duration: 4000,
    })
  }

  return (
    <TooltipProvider delayDuration={300}>
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 h-14">

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-wide text-foreground">Event Assistant</span>
              <span className="text-[10px] text-muted-foreground leading-none">Networking Intelligence</span>
            </div>
          </div>

          <nav className="flex items-center gap-0.5 flex-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all duration-150 whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            {hasData ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 bg-muted/60 cursor-default select-none">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                    <span className="text-xs text-foreground whitespace-nowrap">
                      {eventsCount > 0 && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-muted-foreground inline-block" />
                          <span>{eventsCount.toLocaleString()} events</span>
                          {organizationsCount > 0 && (
                            <>
                              <span className="text-muted-foreground mx-0.5">·</span>
                              <Building2 className="h-3 w-3 text-muted-foreground inline-block" />
                              <span>{organizationsCount.toLocaleString()} orgs</span>
                            </>
                          )}
                        </span>
                      )}
                      {eventsCount === 0 && organizationsCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-muted-foreground inline-block" />
                          <span>{organizationsCount.toLocaleString()} orgs</span>
                        </span>
                      )}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {uploadTimestamp ? (
                    <span>Last uploaded: {formatNavTimestamp(uploadTimestamp)}</span>
                  ) : (
                    <span>Data loaded</span>
                  )}
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="text-xs text-muted-foreground px-1">No data loaded</span>
            )}

            <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Clear Data
                </TooltipContent>
              </Tooltip>
              <AlertDialogContent className="max-w-sm">
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20">
                      <ShieldAlert className="h-5 w-5 text-destructive" />
                    </div>
                    <AlertDialogTitle className="text-base">Clear all data?</AlertDialogTitle>
                  </div>
                </AlertDialogHeader>

                <div className="space-y-3 px-1">
                  <div className="rounded-md border border-border bg-muted/50 px-3 py-2.5 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">This will delete:</p>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                        {eventsCount.toLocaleString()} event{eventsCount !== 1 ? "s" : ""}
                      </li>
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                        {organizationsCount.toLocaleString()} organization{organizationsCount !== 1 ? "s" : ""}
                      </li>
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                        All cached recommendations
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-md border border-border bg-muted/30 px-3 py-2 flex items-start gap-2">
                    <CircleCheck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Client profiles will <span className="font-medium text-foreground">NOT</span> be deleted
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground px-0.5">
                    This action cannot be undone.
                  </p>
                </div>

                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button variant="destructive" size="sm" onClick={handleClearAll}>
                    Yes, Clear All Data
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setEmailSettingsOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Email Settings
              </TooltipContent>
            </Tooltip>

            <EmailSettingsModal open={emailSettingsOpen} onOpenChange={setEmailSettingsOpen} />

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium max-w-[140px]">
                    <span className="truncate">{getUserDisplayName(user.email ?? "")}</span>
                    <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {hasData && (
                    <>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          setClearDialogOpen(true)
                        }}
                        className="text-destructive focus:text-destructive gap-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Clear Data
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut} className="gap-2">
                    <LogOut className="h-3.5 w-3.5" />
                    {isSigningOut ? "Signing out..." : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}

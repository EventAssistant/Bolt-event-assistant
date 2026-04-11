import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Upload, CircleUser as UserCircle, Sparkles, Inbox, LogOut, Building2, Trash2, CircleCheck, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useSession } from "@/contexts/SessionContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

const navItems = [
  { path: "/upload", label: "CSV Upload", icon: Upload },
  { path: "/organizations", label: "Organizations", icon: Building2 },
  { path: "/profile", label: "Client Profile", icon: UserCircle },
  { path: "/recommendations", label: "Recommendations", icon: Sparkles },
  { path: "/submissions", label: "Submitted Profiles", icon: Inbox },
]

export function NavBar() {
  const { user, signOut } = useAuth()
  const { events, organizations, eventsUploadedAt, clearAll } = useSession()
  const eventsCount = events.length
  const organizationsCount = organizations.length

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
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

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

  const [clearDialogOpen, setClearDialogOpen] = useState(false)

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
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-0">
        <div className="flex items-center gap-3 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-wide text-foreground">Event Assistant</span>
            <span className="text-xs text-muted-foreground">Networking Intelligence</span>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 py-4">
          {eventsCount > 0 ? (
            <div className="flex flex-col items-end gap-0">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  {eventsCount} event{eventsCount !== 1 ? "s" : ""} loaded
                </span>
              </div>
              {eventsUploadedAt && (
                <span className="text-[10px] text-muted-foreground/50 leading-none">
                  Last uploaded: {formatNavTimestamp(eventsUploadedAt)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No data loaded</span>
          )}

          {organizationsCount > 0 && (
            <NavLink
              to="/organizations"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <Building2 className="h-3.5 w-3.5" />
              <Badge variant="secondary" className="text-xs px-1.5 py-0 font-medium">
                {organizationsCount}
              </Badge>
            </NavLink>
          )}

          <EmailSettingsModal />

          {eventsCount > 0 && (
            <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-destructive h-8 px-2">
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-xs">Clear Data</span>
                </Button>
              </AlertDialogTrigger>
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
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

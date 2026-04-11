import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Upload, CircleUser as UserCircle, Sparkles, Inbox, LogOut, Building2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useSession } from "@/contexts/SessionContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmailSettingsModal } from "@/components/EmailSettingsModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
  const { events, organizations, clearAll } = useSession()
  const eventsCount = events.length
  const organizationsCount = organizations.length
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

  const handleClearAll = () => {
    clearAll()
    navigate("/upload")
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
            <>
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">
                {eventsCount} event{eventsCount !== 1 ? "s" : ""} loaded
              </span>
            </>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-destructive h-8 px-2">
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-xs">Clear Data</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all session data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all uploaded CSV data, organizations, and reset the client profile. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll}>Clear All Data</AlertDialogAction>
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

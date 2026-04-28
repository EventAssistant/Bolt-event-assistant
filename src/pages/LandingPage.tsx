import { Link } from "react-router-dom"
import { CalendarCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
            <CalendarCheck className="w-8 h-8 text-primary" strokeWidth={1.75} />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              Event Assistant
            </h1>
            <p className="text-lg text-muted-foreground leading-snug">
              Personalized networking event recommendations for San Antonio professionals.
            </p>
          </div>
        </div>

        <div className="flex flex-col w-full gap-3">
          <Button asChild size="lg" className="w-full font-semibold">
            <Link to="/demo">Try the Demo</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full font-semibold">
            <Link to="/login">Login to Full App</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          Upload your client list and get curated event and organization recommendations — matched to each client's goals and industry.
        </p>
      </div>
    </div>
  )
}

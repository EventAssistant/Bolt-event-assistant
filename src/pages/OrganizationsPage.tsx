import { useSession } from "@/contexts/SessionContext"
import { OrganizationUploadSection } from "@/components/OrganizationUploadSection"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"

export function OrganizationsPage() {
  const { organizations, setOrganizations } = useSession()

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          Organizations
        </h1>
        <p className="text-muted-foreground">Manage and view your organizations data</p>
      </div>

      {organizations.length > 0 && (
        <Card className="border-border bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Loaded Organizations</CardTitle>
                <CardDescription className="mt-1">
                  You have {organizations.length} organization{organizations.length !== 1 ? "s" : ""} loaded
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <OrganizationUploadSection onOrganizationsChange={setOrganizations} />
    </div>
  )
}

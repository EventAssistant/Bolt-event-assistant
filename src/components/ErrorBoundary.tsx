import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { TriangleAlert as AlertTriangle, Hop as Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  children: ReactNode
  pageName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary] Rendering error on page "${this.props.pageName ?? "unknown"}":`, error)
    console.error("[ErrorBoundary] Component stack:", info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = "/upload"
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-4">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl text-foreground">
                Something went wrong on this page
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                An unexpected error occurred while loading{" "}
                {this.props.pageName ? (
                  <span className="font-medium text-foreground">{this.props.pageName}</span>
                ) : (
                  "this page"
                )}
                . This is usually caused by missing data or a temporary issue — trying again often resolves it.
              </p>
              {this.state.error?.message && (
                <div className="rounded-md border border-destructive/15 bg-destructive/8 px-3 py-2">
                  <p className="font-mono text-xs text-destructive/80 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3 pt-2">
              <Button
                size="sm"
                onClick={this.handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={this.handleGoHome}
                className="gap-2"
              >
                <Home className="h-3.5 w-3.5" />
                Go to Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

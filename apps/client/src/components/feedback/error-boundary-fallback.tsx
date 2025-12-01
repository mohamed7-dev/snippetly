import { AlertTriangleIcon, HomeIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Link } from '@tanstack/react-router'

export function ErrorBoundaryFallback() {
  return (
    <div className="w-full text-center space-y-6">
      <div className="max-w-md mx-auto space-y-4">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangleIcon className="w-8 h-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Something went wrong
            </h1>
            <p className="text-muted-foreground">
              We encountered an unexpected error. This has been logged and we'll
              look into it.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          asChild
          className="w-full bg-transparent"
          size="lg"
        >
          <Link to="/">
            <HomeIcon className="w-4 h-4 mr-2" />
            Go to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}

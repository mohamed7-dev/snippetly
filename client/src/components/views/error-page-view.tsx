import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function ErrorPageView({
  error,
  reset,
  containerProps,
}: {
  error: Error
  reset: () => void
  containerProps?: React.ComponentProps<'div'>
}) {
  return (
    <div
      {...containerProps}
      className={cn(
        'min-h-screen bg-background flex items-center justify-center p-4',
        containerProps?.className,
      )}
    >
      <div className="max-w-md w-full text-center space-y-6">
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

        <div className="space-y-3">
          <Button onClick={reset} className="w-full" size="lg">
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Try again
          </Button>

          <Button
            variant="outline"
            asChild
            className="w-full bg-transparent"
            size="lg"
          >
            <Link to="/dashboard">
              <HomeIcon className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-muted p-4 rounded-lg text-sm">
            <summary className="cursor-pointer font-medium mb-2">
              Error Details
            </summary>
            <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

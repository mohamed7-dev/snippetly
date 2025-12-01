import { FileQuestion, Home, SearchIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Link } from '@tanstack/react-router'

export type NotFoundMetaData = {
  title?: string
  description?: string
}

export function NotFoundPageView({ title, description }: NotFoundMetaData) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <FileQuestion className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {title ?? 'Page not found'}
            </h1>
            <p className="text-muted-foreground">
              {description ??
                "The page you're looking for doesn't exist or has been moved."}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link to="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>

          <Button
            variant="outline"
            asChild
            className="w-full bg-transparent"
            size="lg"
          >
            <Link to="/dashboard/discover">
              <SearchIcon className="w-4 h-4 mr-2" />
              Discover Snippets
            </Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Looking for something specific?</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link
              to="/dashboard/snippets/new"
              className="text-primary hover:underline"
            >
              Create Snippet
            </Link>
            <Link
              to="/dashboard/collections"
              className="text-primary hover:underline"
            >
              Browse Collections
            </Link>
            <Link
              to="/dashboard/friends"
              className="text-primary hover:underline"
            >
              Find Friends
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

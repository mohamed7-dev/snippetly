import { Button } from '@/components/ui/button'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeftIcon, EditIcon } from 'lucide-react'
import { CopyButton } from './copy-button'

export function PageHeader() {
  const params = useParams({ from: '/(protected)/dashboard/snippets/$slug/' })

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <CopyButton />

          <Button size="sm" asChild>
            <Link
              to={'/dashboard/snippets/$slug/edit'}
              params={{ slug: params.slug }}
              from="/dashboard/snippets/$slug/edit"
            >
              <EditIcon className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { FilterIcon, PlusIcon } from 'lucide-react'

export function MainContentHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="font-heading font-bold text-2xl">My Snippets</h1>
        <p className="text-muted-foreground">
          Manage and organize your code snippets
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <FilterIcon className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button size="sm" asChild>
          <Link to="/dashboard/snippets/new">
            <PlusIcon className="h-4 w-4 mr-2" />
            <span>New Snippet</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

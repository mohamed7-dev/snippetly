import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper'
import { clientRoutes } from '@/lib/routes'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, PlusIcon, SearchIcon } from 'lucide-react'

export function CollectionPageHeader() {
  return (
    <HeaderWrapper className="flex items-center justify-between ">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            to={clientRoutes.collections}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Collections
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            className="pl-10 bg-muted/50 border-border"
          />
        </div>

        <Button size="sm" asChild>
          <Link to={clientRoutes.createSnippet}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Snippet
          </Link>
        </Button>
      </div>
    </HeaderWrapper>
  )
}

import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  BellIcon,
  BookOpenIcon,
  Code2Icon,
  SearchIcon,
  UsersIcon,
} from 'lucide-react'

export function DashboardSidebar() {
  const query = useSuspenseQuery(getCurrentUserDashboardOptions)
  const collections = query.data.data.collections
  return (
    <aside className="w-64 border-r border-border bg-muted/30 min-h-[calc(100vh-73px)]">
      <div className="p-6">
        <nav className="space-y-2">
          <Link
            to={'/dashboard'}
            activeProps={{
              className: 'bg-primary/10 text-primary hover:bg-primary/10',
            }}
            activeOptions={{ exact: true }}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Code2Icon className="h-4 w-4" />
            All Snippets
          </Link>
          <Link
            to={'/dashboard/collections'}
            activeOptions={{ exact: true }}
            activeProps={{
              className: 'bg-primary/10 text-primary hover:bg-primary/10',
            }}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <BookOpenIcon className="h-4 w-4" />
            Collections
          </Link>
          <Link
            to={'/dashboard/friends'}
            activeOptions={{ exact: true }}
            activeProps={{
              className: 'bg-primary/10 text-primary hover:bg-primary/10',
            }}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <UsersIcon className="h-4 w-4" />
            Friends
          </Link>
          <Link
            to="/dashboard/discover"
            activeOptions={{ exact: true }}
            activeProps={{
              className: 'bg-primary/10 text-primary hover:bg-primary/10',
            }}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <SearchIcon className="h-4 w-4" />
            Discover
          </Link>
          <Link
            to="/dashboard/requests"
            activeOptions={{ exact: true }}
            activeProps={{
              className: 'bg-primary/10 text-primary hover:bg-primary/10',
            }}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <BellIcon className="h-4 w-4" />
            Requests
          </Link>
        </nav>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Collections
          </h3>
          <div className="space-y-1">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to={'/dashboard/collections/$slug'}
                params={{ slug: collection.slug }}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <div
                  className={`size-4 rounded-full`}
                  style={{
                    backgroundColor: collection.color,
                  }}
                />
                <span className="flex-1">{collection.title}</span>
                <span className="text-xs">{0}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

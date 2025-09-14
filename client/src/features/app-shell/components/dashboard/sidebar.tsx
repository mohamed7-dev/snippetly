import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'
import { clientRoutes } from '@/lib/routes'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { BookOpenIcon, Code2Icon, UsersIcon } from 'lucide-react'

export function DashboardSidebar() {
  const query = useSuspenseQuery(getCurrentUserDashboardOptions)
  const collections = query.data.data.folders
  return (
    <aside className="w-64 border-r border-border bg-muted/30 min-h-[calc(100vh-73px)]">
      <div className="p-6">
        <nav className="space-y-2">
          <Link
            to={clientRoutes.dashboard}
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
            to={clientRoutes.collections}
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
            to={clientRoutes.friends}
            activeOptions={{ exact: true }}
            activeProps={{
              className: 'bg-primary/10 text-primary hover:bg-primary/10',
            }}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <UsersIcon className="h-4 w-4" />
            Friends
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
                to={clientRoutes.collection}
                params={{ slug: collection.code }}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <div className={`h-3 w-3 rounded-full ${collection.color}`} />
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

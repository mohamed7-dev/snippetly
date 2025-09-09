import { DashboardSidebar } from '@/features/app-shell/components/dashboard/sidebar'
import { Button } from '../ui/button'
import {
  BookOpenIcon,
  Code2Icon,
  FilterIcon,
  PlusIcon,
  StarIcon,
  UsersIcon,
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { DashboardSnippetCard } from '@/features/snippets/components/dashboard-snippet-card'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCurrentUserDashboardOptions } from '@/features/user/lib/api'

export function DashBoardPageView() {
  const query = useSuspenseQuery(getCurrentUserDashboardOptions)
  const snippets = query.data.data.snippets
  const dashboardInfo = query.data.data
  return (
    <div className="flex-1 flex">
      <DashboardSidebar />
      <main className="flex-1 p-6">
        <div className="mb-6">
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
              <Button size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Snippet
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Code2Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Total Snippets</span>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {dashboardInfo.snippetsCount}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">Collections</span>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {dashboardInfo.foldersCount}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <StarIcon className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Starred</span>
                </div>
                <p className="text-base font-bold mt-1">
                  TODO: not implemented
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Friends</span>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {dashboardInfo.friendsCount}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {snippets.map((snippet) => (
            <DashboardSnippetCard snippet={snippet} />
          ))}
        </div>
        {snippets.length === 0 && (
          <div className="text-center py-12">
            <Code2Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-lg mb-2">
              No snippets yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first code snippet to get started
            </p>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Snippet
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

import { Card, CardContent } from '@/components/ui/card'
import { useSuspenseQuery } from '@tanstack/react-query'
import { BookOpenIcon, Code2Icon, StarIcon, UsersIcon } from 'lucide-react'
import { getCurrentUserDashboardOptions } from '../lib/api'

export function StatsSection() {
  const query = useSuspenseQuery(getCurrentUserDashboardOptions)
  const stats = query.data.stats
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Code2Icon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Total Snippets</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.snippetsCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium">Collections</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.collectionsCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <StarIcon className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Friendship Requests</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.friendsInboxCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Friends</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.friendsCount}</p>
        </CardContent>
      </Card>
    </div>
  )
}

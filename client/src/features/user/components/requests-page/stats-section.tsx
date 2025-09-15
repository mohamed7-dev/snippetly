import { Card, CardContent } from '@/components/ui/card'
import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ClockIcon, MailIcon, UsersIcon } from 'lucide-react'

export function StatsSection() {
  const {
    data: { stats },
  } = useSuspenseQuery(getCurrentUserDashboardOptions)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MailIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {stats.friendsInboxCount}
              </div>
              <p className="text-sm text-muted-foreground">Incoming Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {stats.friendsOutboxCount}
              </div>
              <p className="text-sm text-muted-foreground">Sent Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <UsersIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.friendsCount}</div>
              <p className="text-sm text-muted-foreground">Total Friends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

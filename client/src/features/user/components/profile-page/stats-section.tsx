import { Card, CardContent } from '@/components/ui/card'
import { CodeIcon, GitForkIcon, UserIcon, UsersIcon } from 'lucide-react'
import { useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getUserProfile } from '../../lib/api'

export function StatsSection() {
  const { name } = useParams({ from: '/(public)/profile/$name' })
  const { data } = useSuspenseQuery(getUserProfile(name))
  const stats = data.stats
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CodeIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.snippetsCount}</div>
            <p className="text-xs text-muted-foreground">Snippets</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <UsersIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.collectionsCount}</div>
            <p className="text-xs text-muted-foreground">Collections</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <UserIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.friendsCount}</div>
            <p className="text-xs text-muted-foreground">Friends</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <GitForkIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Forks</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

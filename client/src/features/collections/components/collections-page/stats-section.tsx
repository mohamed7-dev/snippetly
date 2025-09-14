import { Card, CardContent } from '@/components/ui/card'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { BookOpenIcon, Code2Icon, EyeIcon, GitForkIcon } from 'lucide-react'
import { getCurrentUserCollectionsOptions } from '../../lib/api'

export function StatsSection() {
  const { data } = useSuspenseInfiniteQuery(getCurrentUserCollectionsOptions)
  const stats = data.pages?.[0]?.stats

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Total Collections</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.collectionsCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Code2Icon className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium">Total Snippets</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.snippetsCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <EyeIcon className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Public Collections</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.publicCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <GitForkIcon className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Forked Collections</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.forkedCount}</p>
        </CardContent>
      </Card>
    </div>
  )
}

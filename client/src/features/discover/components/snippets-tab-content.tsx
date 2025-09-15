import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GitForkIcon } from 'lucide-react'
import { discoverSnippetsQueryOptions } from '../lib/api'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

export function SnippetsTabContent() {
  const { data } = useSuspenseInfiniteQuery(discoverSnippetsQueryOptions)
  const snippets = data.pages?.flatMap((p) => p.items) ?? []

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {snippets.map((snippet) => (
        <Card key={snippet.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg hover:text-primary">
                  <Link
                    to={'/dashboard/snippets/$slug'}
                    params={{ slug: snippet.slug }}
                  >
                    {snippet.title}
                  </Link>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  by @{snippet.creator.name}
                </p>
              </div>
              <Badge variant="outline">{snippet.language}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
              <code>{snippet.code}</code>
            </pre>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <GitForkIcon className="h-4 w-4" />
                {snippet?.forkedCount ?? 0}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

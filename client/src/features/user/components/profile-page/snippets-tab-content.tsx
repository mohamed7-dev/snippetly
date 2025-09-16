import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProfileSnippetsOptions } from '@/features/snippets/lib/api'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { GitForkIcon } from 'lucide-react'

export function SnippetsTabContent() {
  const { name } = useParams({ from: '/(public)/profile/$name' })
  const { data } = useSuspenseInfiniteQuery(getProfileSnippetsOptions(name))
  const snippets = data.pages?.flatMap((p) => p.items) ?? []
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {snippets.map((snippet) => (
        <Card key={snippet.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg hover:text-primary">
                  <Link
                    to="/dashboard/snippets/$slug"
                    params={{ slug: snippet.slug }}
                  >
                    {snippet.title}
                  </Link>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {snippet.description}
                </p>
              </div>
              <Badge variant="outline">{snippet.language}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {snippet.tags?.map((tag) => (
                <Badge key={tag.name} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <GitForkIcon className="h-4 w-4" />0
                </div>
              </div>
              <span>{new Date(snippet.createdAt)?.toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

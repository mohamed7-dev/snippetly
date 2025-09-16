import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Code2Icon, GitForkIcon, PlusIcon } from 'lucide-react'
import { discoverSnippetsQueryOptions } from '../lib/api'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'
import { Button } from '@/components/ui/button'
import React from 'react'

export function SnippetsTabContent() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(discoverSnippetsQueryOptions)
  const snippets = data.pages?.flatMap((p) => p.items) ?? []

  return (
    <React.Fragment>
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
      <InfiniteLoader
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        Content={
          !snippets.length ? (
            <div className="text-center py-12">
              <Code2Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                No snippets yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first code snippet to get started
              </p>
              <Button asChild>
                <Link to="/dashboard/snippets/new">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  <span>Create Snippet</span>
                </Link>
              </Button>
            </div>
          ) : null
        }
      />
    </React.Fragment>
  )
}

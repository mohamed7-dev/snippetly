import { Code2Icon, PlusIcon } from 'lucide-react'
import { discoverSnippetsQueryOptions } from '../lib/api'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'
import { Button } from '@/components/ui/button'
import React from 'react'
import { SnippetCard } from '@/features/snippets/components/snippet-card'
import { useAuth } from '@/features/auth/components/auth-provider'

export function SnippetsTabContent() {
  const { getCurrentUser } = useAuth()
  const user = getCurrentUser()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(discoverSnippetsQueryOptions)
  const snippets = data.pages?.flatMap((p) => p.items) ?? []
  // TODO: This will be implemented server side
  const filteredSnippets = snippets.filter(
    (snippet) => snippet.creator.username !== user?.name,
  )
  return (
    <React.Fragment>
      <p>
        TODO: Implement views/interaction based listing of trending snippets
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredSnippets.map((snippet) => (
          <SnippetCard key={snippet.publicId} snippet={{ ...snippet }} />
        ))}
      </div>
      <InfiniteLoader
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        Content={
          !filteredSnippets.length ? (
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

import React from 'react'
import { Button } from '@/components/ui/button'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Code2Icon, PlusIcon } from 'lucide-react'
import { SnippetCard } from '@/features/snippets/components/snippet-card'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'
import { getCurrentSnippetsOptions } from '@/features/snippets/lib/api'

export function SnippetsSection() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(getCurrentSnippetsOptions)
  const snippets = data.pages.flatMap((p) => p.items) ?? []
  return (
    <React.Fragment>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {snippets.map((snippet) => (
          <SnippetCard key={snippet.publicId} snippet={snippet} />
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

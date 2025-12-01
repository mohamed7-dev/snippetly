import { Button } from '@/components/ui/button'
import { useInfiniteQuery } from '@tanstack/react-query'
import React from 'react'
import { getCurrentUserFriendsSnippets } from '../../lib/api'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'
import { Code2Icon, PlusIcon } from 'lucide-react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { FilterMenu, useFilter } from '@/components/filter-menu'
import { SnippetCard } from '@/features/snippets/components/snippet-card'

export function FriendsSnippetsTabContent() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(getCurrentUserFriendsSnippets)
  const snippets = data?.pages?.flatMap((p) => p.items) ?? []

  const { filter } = useSearch({ from: '/(protected)/dashboard/friends' })
  const navigate = useNavigate({ from: '/dashboard/friends' })
  const filteredSnippets = useFilter({ data: snippets, filter })

  return (
    <React.Fragment>
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-xl">
          Friends' Snippets
        </h2>
        <div className="flex items-center gap-2">
          <FilterMenu
            selected={filter}
            onSelect={(selected) => navigate({ search: { filter: selected } })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSnippets.map((snippet) => (
          <SnippetCard snippet={{ ...snippet, isPrivate: false }} />
        ))}
      </div>
      <InfiniteLoader
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        Content={
          !filteredSnippets.length ? (
            <div className="text-center py-12">
              <Code2Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                No friends yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first friend to start learning from others.
              </p>
              <Button asChild>
                <Link to="/dashboard/discover">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  <span>Discover Developers</span>
                </Link>
              </Button>
            </div>
          ) : null
        }
      />
    </React.Fragment>
  )
}

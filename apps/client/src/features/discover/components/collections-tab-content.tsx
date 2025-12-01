import { LibraryIcon, PlusIcon } from 'lucide-react'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { discoverCollectionsQueryOptions } from '../lib/api'
import React from 'react'
import { CollectionCard } from '@/features/collections/components/collection-card'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function CollectionsTabContent() {
  const { getCurrentUser } = useAuth()
  const user = getCurrentUser()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(discoverCollectionsQueryOptions)
  const collections = data.pages?.flatMap((p) => p.items) ?? []
  const filteredCollections = collections.filter(
    (collection) => collection.creator.username !== user?.name,
  )

  return (
    <React.Fragment>
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredCollections.map((collection) => (
          <CollectionCard
            key={collection.publicId}
            collection={{
              ...collection,
              creatorName: collection.creator.username,
            }}
          />
        ))}
      </div>
      <InfiniteLoader
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        Content={
          !filteredCollections.length ? (
            <div className="text-center py-12">
              <LibraryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                No collections yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first collection to get started
              </p>
              <Button asChild>
                <Link to="/dashboard/collections/new">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  <span>Create Collection</span>
                </Link>
              </Button>
            </div>
          ) : null
        }
      />
    </React.Fragment>
  )
}

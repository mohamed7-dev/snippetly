import React from 'react'
import { Button } from '@/components/ui/button'
import { Link, useSearch } from '@tanstack/react-router'
import { BookOpenIcon, PlusIcon } from 'lucide-react'
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { getCurrentUserCollectionsOptions } from '../../lib/api'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'
import { useFilter } from '@/components/filter-menu'
import { CollectionCard } from '../collection-card'

export function CollectionsGridSection() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(getCurrentUserCollectionsOptions)
  const collections = data.pages?.flatMap((page) => page.items) ?? []

  // filter
  const { filter } = useSearch({
    from: '/(protected)/dashboard/_dashboard-layout/_error-boundary/collections/',
  })
  const filteredCollections = useFilter({ data: collections, filter })

  const qClient = useQueryClient()
  const onDeleteSuccess = () => {
    qClient.invalidateQueries({ queryKey: ['users', 'current', 'dashboard'] })
  }
  return (
    <React.Fragment>
      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => (
          <CollectionCard
            key={collection.publicId}
            collection={{
              ...collection,
              creatorName: collection.creator.username,
              snippetsCount: collection.snippetsCount,
            }}
            deleteCollection={{
              onSuccess: onDeleteSuccess,
            }}
          />
        ))}
      </div>
      <InfiniteLoader
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isManual={true}
        Content={
          !filteredCollections.length ? (
            <div className="text-center py-12">
              <BookOpenIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                No collections yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first collection to organize your code snippets
              </p>
              <Button asChild>
                <Link to={'/dashboard/collections/new'}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Collection
                </Link>
              </Button>
            </div>
          ) : null
        }
      />
    </React.Fragment>
  )
}

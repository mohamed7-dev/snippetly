import { CollectionCard } from '@/features/collections/components/collection-card'
import { getProfileCollectionsOptions } from '@/features/collections/lib/api'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

export function CollectionsTabContent() {
  const { name } = useParams({ from: '/(public)/profile/$name' })
  const { data } = useSuspenseInfiniteQuery(getProfileCollectionsOptions(name))
  const collections = data.pages?.flatMap((p) => p.items) ?? []
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.publicId}
          collection={{
            ...collection,
            creatorName: collection.creator.username,
          }}
        />
      ))}
    </div>
  )
}

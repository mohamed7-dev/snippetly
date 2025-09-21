import { searchFilterSchema } from '@/components/filter-menu'
import { CollectionsPageView } from '@/components/views/collections-page-view'
import { getCurrentUserCollectionsOptions } from '@/features/collections/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/_dashboard-layout/_error-boundary/collections/',
)({
  component: CollectionsPage,
  head: () => {
    return {
      meta: [
        {
          title: 'All Collections',
        },
      ],
    }
  },
  validateSearch: searchFilterSchema,
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchInfiniteQuery(getCurrentUserCollectionsOptions)
  },
})

function CollectionsPage() {
  return <CollectionsPageView />
}

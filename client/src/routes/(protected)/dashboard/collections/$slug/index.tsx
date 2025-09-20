import { searchFilterSchema } from '@/components/filter-menu'
import { CollectionPageView } from '@/components/views/collection-page-view'
import { getSnippetsByCollectionOptions } from '@/features/snippets/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/collections/$slug/',
)({
  component: RouteComponent,
  validateSearch: searchFilterSchema,
  loader: ({ context: { queryClient }, params: { slug } }) => {
    queryClient.prefetchInfiniteQuery(getSnippetsByCollectionOptions(slug))
  },
})

function RouteComponent() {
  return <CollectionPageView />
}

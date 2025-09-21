import { searchFilterSchema } from '@/components/filter-menu'
import { queryClient } from '@/components/providers/tanstack-query-provider'
import { CollectionPageView } from '@/components/views/collection-page-view'
import { getCollectionQueryOptions } from '@/features/collections/lib/api'
import { getSnippetsByCollectionOptions } from '@/features/snippets/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/collections/$slug/',
)({
  component: RouteComponent,
  head: async ({ params }) => {
    const data = await queryClient.ensureQueryData(
      getCollectionQueryOptions(params.slug),
    )
    return {
      meta: [
        {
          name: 'description',
          content:
            data.data.description ??
            `Collection of snippets related to ${data.data.title}`,
        },
        {
          title: data.data.title,
        },
      ],
    }
  },
  validateSearch: searchFilterSchema,
  loader: ({ context: { queryClient }, params: { slug } }) => {
    queryClient.prefetchInfiniteQuery(getSnippetsByCollectionOptions(slug))
  },
})

function RouteComponent() {
  return <CollectionPageView />
}

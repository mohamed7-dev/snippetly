import { PageLoader } from '@/components/loaders/page-loader'
import { CollectionPageView } from '@/components/views/collection-page-view'
import { getCollectionQueryOptions } from '@/features/collections/lib/api'
import { getSnippetsByCollectionOptions } from '@/features/snippets/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/collections/$slug/',
)({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    await queryClient.ensureInfiniteQueryData(
      getSnippetsByCollectionOptions(slug),
    )
    await queryClient.ensureQueryData(getCollectionQueryOptions(slug))
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  errorComponent: (error) => <>{JSON.stringify(error.error)}</>,
})

function RouteComponent() {
  return <CollectionPageView />
}

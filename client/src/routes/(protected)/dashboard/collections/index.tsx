import { PageLoader } from '@/components/loaders/page-loader'
import { CollectionsPageView } from '@/components/views/collections-page-view'
import { getCurrentUserCollectionsOptions } from '@/features/collections/lib/api'
import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/collections/')({
  component: CollectionsPage,
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchInfiniteQuery(getCurrentUserCollectionsOptions)
    await queryClient.ensureQueryData(getCurrentUserDashboardOptions)
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  errorComponent: (error) => <p>Error, {JSON.stringify(error.error)}</p>,
})

function CollectionsPage() {
  return <CollectionsPageView />
}

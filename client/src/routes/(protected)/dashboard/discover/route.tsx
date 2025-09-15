import { PageLoader } from '@/components/loaders/page-loader'
import { DiscoverPageView } from '@/components/views/discover-page-view'
import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'
import { discoverUsersQueryOptions } from '@/features/discover/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/discover')({
  component: DiscoverPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureInfiniteQueryData(discoverUsersQueryOptions)
    await queryClient.ensureQueryData(getCurrentUserDashboardOptions)
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  errorComponent: (error) => <>{JSON.stringify(error.error)}</>,
})

function DiscoverPage() {
  return <DiscoverPageView />
}

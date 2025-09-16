import { PageLoader } from '@/components/loaders/page-loader'
import { RequestPageView } from '@/components/views/request-page-view'
import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'
import { getCurrentUserInbox } from '@/features/user/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/requests')({
  component: RequestPage,
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchInfiniteQuery(getCurrentUserInbox)
    await queryClient.ensureQueryData(getCurrentUserDashboardOptions)
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  errorComponent: (error) => <>{JSON.stringify(error.error)}</>,
})

function RequestPage() {
  return <RequestPageView />
}

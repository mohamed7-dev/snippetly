import { PageLoader } from '@/components/loaders/page-loader'
import { DashBoardPageView } from '@/components/views/dashboard-page-view'
import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'
import { getCurrentUserSnippetsOptions } from '@/features/snippets/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/')({
  component: DashboardPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getCurrentUserDashboardOptions)
    queryClient.prefetchInfiniteQuery(getCurrentUserSnippetsOptions)
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  errorComponent: (error) => <p>Error, {JSON.stringify(error.error)}</p>,
})

function DashboardPage() {
  return <DashBoardPageView />
}

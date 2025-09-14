import { createFileRoute, Outlet } from '@tanstack/react-router'
import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'
import { PageLoader } from '@/components/loaders/page-loader'

export const Route = createFileRoute('/(protected)/dashboard')({
  component: DashboardLayout,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getCurrentUserDashboardOptions)
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  errorComponent: (error) => <p>Error, {JSON.stringify(error.error)}</p>,
})

function DashboardLayout() {
  // TODO: Protect Pages
  return <Outlet />
}

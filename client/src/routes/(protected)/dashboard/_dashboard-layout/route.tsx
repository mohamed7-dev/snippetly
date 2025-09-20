import { PageLoader } from '@/components/loaders/page-loader'
import { ErrorPageView } from '@/components/views/error-page-view'
import { DashboardLayout } from '@/features/app-shell/components/dashboard/dashboard-layout'
import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'
import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'
import { AxiosError } from 'axios'

export const Route = createFileRoute(
  '/(protected)/dashboard/_dashboard-layout',
)({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getCurrentUserDashboardOptions)
  },
  onError: (e) => {
    if (e instanceof AxiosError && e.status === 404)
      return notFound({ data: { message: e.response?.data?.message } })
    else throw e
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  errorComponent: (error) => (
    <ErrorPageView
      error={error.error}
      reset={error.reset}
      containerProps={{ className: 'min-h-auto' }}
    />
  ),
})

function RouteComponent() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}

import { PageLoader } from '@/components/loaders/page-loader'
import { ErrorPageView } from '@/components/views/error-page-view'
import {
  NotFoundPageView,
  type NotFoundMetaData,
} from '@/components/views/not-found-page-view'
import { DashboardLayout } from '@/features/app-shell/components/dashboard/dashboard-layout'
import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'
import { notFoundWithMetadata } from '@/lib/utils'
import { createFileRoute, Outlet } from '@tanstack/react-router'
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
      throw notFoundWithMetadata({
        data: { title: e.message, description: e.response?.data?.message },
      })
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
  notFoundComponent: (metadata) => (
    <NotFoundPageView
      title={(metadata.data as NotFoundMetaData)?.title}
      description={(metadata.data as NotFoundMetaData)?.description}
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

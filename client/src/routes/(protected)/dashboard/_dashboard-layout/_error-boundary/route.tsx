import { PageLoader } from '@/components/loaders/page-loader'
import { ErrorPageView } from '@/components/views/error-page-view'
import { notFoundWithMetadata } from '@/lib/utils'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AxiosError } from 'axios'

export const Route = createFileRoute(
  '/(protected)/dashboard/_dashboard-layout/_error-boundary',
)({
  component: RouteComponent,
  onError: (e) => {
    if (e instanceof AxiosError && e.status === 404)
      return notFoundWithMetadata({
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
})

function RouteComponent() {
  return <Outlet />
}

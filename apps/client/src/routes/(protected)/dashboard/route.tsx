import { PageLoader } from '@/components/loaders/page-loader'
import { notFoundWithMetadata } from '@/lib/utils'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AxiosError } from 'axios'

export const Route = createFileRoute('/(protected)/dashboard')({
  component: DashboardLayout,
  beforeLoad: async ({ context: { authContext }, location }) => {
    if (!authContext) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    await authContext.ensureReady()
    if (!authContext.isAuthenticatedNow()) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  onError: (error) => {
    if (error instanceof AxiosError) {
      if (error.status === 404) {
        throw notFoundWithMetadata({
          data: {
            title: error.message,
            description: error.response?.data?.message,
          },
        })
      }
      throw error
    }
    throw error
  },
})

function DashboardLayout() {
  return <Outlet />
}

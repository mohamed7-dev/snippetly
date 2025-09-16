import { PageLoader } from '@/components/loaders/page-loader'
import { useAuth } from '@/features/auth/components/auth-provider'
import { refreshAccessToken } from '@/features/auth/lib/api'
import { authStore } from '@/features/auth/lib/auth-store'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AxiosError } from 'axios'

export const Route = createFileRoute('/(protected)/dashboard')({
  component: DashboardLayout,
  beforeLoad: async ({ context: { authContext } }) => {
    // refresh access token before reaching the component
    const accessToken = authContext?.accessToken
    if (!accessToken) {
      await refreshAccessToken().then((data) => {
        authContext?.updateAccessToken(data.data.data.accessToken)
        authStore.setAccessToken(data.data.data.accessToken)
      })
    }
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  onError: (error) => {
    if (error instanceof AxiosError && error.status === 401) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

function DashboardLayout() {
  const ctx = useAuth()
  if (!ctx?.accessToken) {
    throw redirect({
      to: '/login',
      search: {
        redirect: location.href,
      },
    })
  }
  return <Outlet />
}

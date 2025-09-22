import { PageLoader } from '@/components/loaders/page-loader'
import { useAuth } from '@/features/auth/components/auth-provider'
import { refreshAccessToken } from '@/features/auth/lib/api'
import { authStore } from '@/features/auth/lib/auth-store'
import { notFoundWithMetadata } from '@/lib/utils'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AxiosError } from 'axios'

export const Route = createFileRoute('/(protected)/dashboard')({
  component: DashboardLayout,
  beforeLoad: async ({ context: { authContext } }) => {
    // refresh access token before reaching the component
    const accessToken = authContext?.accessToken
    if (!accessToken && !authStore.getAccessToken()) {
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
    // this error means that we are trying to refresh without refresh token
    // or an invalid token is used
    if (error instanceof AxiosError) {
      if (error.status === 401) {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        })
      } else if (error.status === 404) {
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
  const ctx = useAuth()
  if (!ctx?.accessToken && !ctx.isLoggedOut) {
    throw redirect({
      to: '/login',
      search: {
        redirect: location.href,
      },
    })
  }
  return <Outlet />
}

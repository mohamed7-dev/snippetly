import { LandingPageView } from '@/components/views/landing-page-view'
import { APP_NAME } from '@/config/app'
import { refreshAccessToken } from '@/features/auth/lib/api'
import { authStore } from '@/features/auth/lib/auth-store'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/')({
  component: LandingPage,
  head: () => {
    return {
      meta: [
        {
          title: APP_NAME,
        },
      ],
    }
  },
  beforeLoad: async ({ context: { authContext } }) => {
    // try to refresh access token before reaching the component
    // so when the page reloads we know if the user has a refresh token or not.
    const accessToken = authContext?.accessToken
    if (!accessToken) {
      await refreshAccessToken()
        .then((data) => {
          authContext?.updateAccessToken(data.data.data.accessToken)
          authStore.setAccessToken(data.data.data.accessToken)
        })
        .catch((e) => {
          console.log('error in public layout', e.message)
        })
    }
  },
})

function LandingPage() {
  return <LandingPageView />
}

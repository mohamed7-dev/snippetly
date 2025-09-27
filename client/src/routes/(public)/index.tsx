import { LandingPageView } from '@/components/views/landing-page-view'
import { APP_NAME } from '@/config/app'
import { getAllSavedSnippets } from '@/lib/offline-store'
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
  loader: async () => {
    return getAllSavedSnippets()
  },
})

function LandingPage() {
  return <LandingPageView />
}

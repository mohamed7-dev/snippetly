import { LandingPageView } from '@/components/views/landing-page-view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main-layout)/_main-layout/')({
  component: App,
})

function App() {
  return <LandingPageView />
}

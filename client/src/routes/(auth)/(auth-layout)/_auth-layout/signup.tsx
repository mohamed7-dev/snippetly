import { SignupPageView } from '@/components/views/signup-page-view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/(auth-layout)/_auth-layout/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SignupPageView />
}

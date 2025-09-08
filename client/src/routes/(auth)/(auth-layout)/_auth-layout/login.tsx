import { LoginPageView } from '@/components/views/login-page-view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/(auth-layout)/_auth-layout/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LoginPageView />
}

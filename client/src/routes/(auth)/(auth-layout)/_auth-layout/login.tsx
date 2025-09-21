import { LoginPageView } from '@/components/views/login-page-view'
import { redirectSchema } from '@/lib/zod'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(auth)/(auth-layout)/_auth-layout/login',
)({
  component: LoginPage,
  validateSearch: redirectSchema,
})

function LoginPage() {
  return <LoginPageView />
}

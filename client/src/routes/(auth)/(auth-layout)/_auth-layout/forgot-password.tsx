import { ForgotPasswordPageView } from '@/components/views/forgot-password-page-view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(auth)/(auth-layout)/_auth-layout/forgot-password',
)({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return <ForgotPasswordPageView />
}

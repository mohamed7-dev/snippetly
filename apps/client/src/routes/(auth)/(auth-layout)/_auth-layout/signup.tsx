import { SignupPageView } from '@/components/views/signup-page-view'
import { redirectSchema } from '@/lib/zod'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(auth)/(auth-layout)/_auth-layout/signup',
)({
  component: SignupPage,
  validateSearch: redirectSchema,
})

function SignupPage() {
  return <SignupPageView />
}

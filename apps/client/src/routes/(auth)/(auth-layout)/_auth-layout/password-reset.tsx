import { PasswordResetPageView } from '@/components/views/password-reset-page-view'
import { searchSchema } from '@/features/auth/lib/schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(auth)/(auth-layout)/_auth-layout/password-reset',
)({
  component: PasswordResetPage,
  validateSearch: searchSchema,
})

function PasswordResetPage() {
  return <PasswordResetPageView />
}

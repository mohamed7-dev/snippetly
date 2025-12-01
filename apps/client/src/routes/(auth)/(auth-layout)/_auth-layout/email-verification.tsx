import { EmailVerificationPageView } from '@/components/views/email-verification-view'
import { searchSchema } from '@/features/auth/lib/schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(auth)/(auth-layout)/_auth-layout/email-verification',
)({
  component: EmailVerificationPage,
  validateSearch: searchSchema,
})

function EmailVerificationPage() {
  return <EmailVerificationPageView />
}

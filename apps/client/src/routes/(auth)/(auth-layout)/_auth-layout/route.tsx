import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/(auth-layout)/_auth-layout')({
  component: RouteComponent,
  beforeLoad: async ({ context: { authContext }, location }) => {
    // If we can't access auth context, do nothing
    if (!authContext) return
    // Ensure auth state is settled (non-throwing)
    await authContext.ensureReady()

    // Allow password reset page even if authenticated
    const isPasswordReset = location.pathname.includes('/password-reset')
    const isEmailVerification = location.pathname.includes(
      '/email-verification',
    )
    if (
      !isPasswordReset &&
      !isEmailVerification &&
      authContext.isAuthenticatedNow()
    ) {
      // Already authenticated, redirect away from auth pages
      throw redirect({ to: '/dashboard' })
    }
  },
})

function RouteComponent() {
  return (
    <main className="min-h-screen">
      <Outlet />
    </main>
  )
}

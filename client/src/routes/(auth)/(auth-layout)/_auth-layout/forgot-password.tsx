import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/(auth-layout)/_auth-layout/forgot-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/forget-password"!</div>
}

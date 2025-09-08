import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/(auth-layout)/_auth-layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main>
      <Outlet />
    </main>
  )
}

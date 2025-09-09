import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/collections')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}

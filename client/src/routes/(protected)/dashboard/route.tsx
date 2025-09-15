import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  // TODO: Protect Pages
  return <Outlet />
}

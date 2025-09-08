import { Header } from '@/features/app-shell'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(main-layout)/_main-layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  )
}

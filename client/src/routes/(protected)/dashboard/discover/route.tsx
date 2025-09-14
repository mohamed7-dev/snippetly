import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/discover')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/dashboard/discover"!</div>
}

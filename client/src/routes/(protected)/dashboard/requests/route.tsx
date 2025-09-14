import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/requests')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/dashboard/requests"!</div>
}

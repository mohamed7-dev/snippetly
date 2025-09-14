import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/collections/$slug/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/dashboard/collections/$slug/edit"!</div>
}

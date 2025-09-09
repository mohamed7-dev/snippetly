import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/friends')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/friends"!</div>
}

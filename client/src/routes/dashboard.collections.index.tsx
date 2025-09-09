import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/collections/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/collections/"!</div>
}

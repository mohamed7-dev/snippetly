import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/snippets/$slug/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/dashboard/snippets/$snippetId/edit"!</div>
}

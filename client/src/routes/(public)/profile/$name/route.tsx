import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/profile/$name')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(public)/profile/$name"!</div>
}

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/snippets/')({
  component: RouteComponent,
})

function RouteComponent() {
  throw redirect({
    to: '/dashboard',
  })
}

import { getSnippetQueryOptions } from '@/features/snippets/lib/api'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/snippets/$slug')({
  component: SnippetLayout,
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    await queryClient.ensureQueryData(getSnippetQueryOptions(slug))
  },
})

function SnippetLayout() {
  return <Outlet />
}

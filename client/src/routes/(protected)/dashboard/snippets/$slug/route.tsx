import { PageLoader } from '@/components/loaders/page-loader'
import { getSnippetQueryOptions } from '@/features/snippets/lib/api'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/snippets/$slug')({
  component: SnippetLayout,
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    await queryClient.ensureQueryData(getSnippetQueryOptions(slug))
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  errorComponent: (err) => <>{JSON.stringify(err.error)}</>,
})

function SnippetLayout() {
  return <Outlet />
}

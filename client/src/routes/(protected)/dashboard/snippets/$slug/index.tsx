import { PageLoader } from '@/components/loaders/page-loader'
import { SnippetPageView } from '@/components/views/snippet-page-view'
import { getSnippetQueryOptions } from '@/features/snippets/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/snippets/$slug/')({
  component: SnippetPage,
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    await queryClient.ensureQueryData(getSnippetQueryOptions(slug))
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  errorComponent: (err) => <>{JSON.stringify(err.error)}</>,
})

function SnippetPage() {
  return <SnippetPageView />
}

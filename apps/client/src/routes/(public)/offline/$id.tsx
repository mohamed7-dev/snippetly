import { createFileRoute } from '@tanstack/react-router'
import { getSavedSnippet } from '@/features/snippets/lib/snippets-store'
import { OfflineSnippetPageView } from '@/components/views/offline-snippet-page-view'

export const Route = createFileRoute('/(public)/offline/$id')({
  component: OfflineSnippetPage,
  loader: async ({ params }) => {
    const meta = await getSavedSnippet(params.id)
    if (!meta) {
      return { status: 'missing' }
    }
    return { status: 'ready', data: meta }
  },
})

function OfflineSnippetPage() {
  return <OfflineSnippetPageView />
}

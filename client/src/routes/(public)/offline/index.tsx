import { createFileRoute } from '@tanstack/react-router'
import { getAllSavedSnippets } from '@/lib/offline-store'
import { OfflineSnippetsPageView } from '@/components/views/offline-snippets-page-view'

export const Route = createFileRoute('/(public)/offline/')({
  component: OfflineLibraryPage,
  loader: async () => {
    return getAllSavedSnippets()
  },
})

function OfflineLibraryPage() {
  return <OfflineSnippetsPageView />
}

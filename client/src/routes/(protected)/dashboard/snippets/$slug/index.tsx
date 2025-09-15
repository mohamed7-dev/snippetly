import { SnippetPageView } from '@/components/views/snippet-page-view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/snippets/$slug/')({
  component: SnippetPage,
})

function SnippetPage() {
  return <SnippetPageView />
}

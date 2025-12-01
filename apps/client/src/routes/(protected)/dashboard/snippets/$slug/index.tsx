import { queryClient } from '@/components/providers/tanstack-query-provider'
import { SnippetPageView } from '@/components/views/snippet-page-view'
import { getSnippetQueryOptions } from '@/features/snippets/lib/api'
import { getSavedSnippet } from '@/lib/offline-store'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/snippets/$slug/')({
  component: SnippetPage,
  head: async ({ params }) => {
    const data = await queryClient.ensureQueryData(
      getSnippetQueryOptions(params.slug),
    )
    return {
      meta: [
        {
          name: 'description',
          content:
            data.data.description ?? `Snippet with title ${data.data.title}`,
        },
        {
          title: data.data.title,
        },
      ],
    }
  },
  loader: async ({ params }) => {
    const data = await getSavedSnippet(params.slug)
    return data
  },
})

function SnippetPage() {
  return <SnippetPageView />
}

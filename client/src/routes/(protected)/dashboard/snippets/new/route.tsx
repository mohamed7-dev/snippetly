import { PageLoader } from '@/components/loaders/page-loader'
import { CreateSnippetPageView } from '@/components/views/create-snippet-page-view'
import { getCurrentUserCollectionsOptions } from '@/features/collections/lib/api'
import { getPopularTagsOptions } from '@/features/tags/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/snippets/new')({
  component: CreateSnippetPage,
  head: () => {
    return {
      meta: [
        {
          title: 'Create New Snippet',
        },
      ],
    }
  },
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getPopularTagsOptions)
    await queryClient.ensureInfiniteQueryData(getCurrentUserCollectionsOptions)
  },
  errorComponent: ({ error }) => console.log(JSON.stringify(error)),
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
})

function CreateSnippetPage() {
  return <CreateSnippetPageView />
}

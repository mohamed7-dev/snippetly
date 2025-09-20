import { EditSnippetPageView } from '@/components/views/edit-snippet-page-view'
import { getCurrentUserCollectionsOptions } from '@/features/collections/lib/api'
import { getSnippetQueryOptions } from '@/features/snippets/lib/api'
import { getPopularTagsOptions } from '@/features/tags/lib/api'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/snippets/$slug/edit',
)({
  component: EditSnippetPage,
  beforeLoad: async ({
    params: { slug },
    context: { queryClient, authContext },
  }) => {
    const { data } = await queryClient.ensureQueryData(
      getSnippetQueryOptions(slug),
    )
    const user = authContext?.getCurrentUser()
    if (user?.name !== data.creator.username) {
      throw redirect({
        to: '/profile/$name',
        params: { name: data.creator.username },
      })
    }
  },
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(getPopularTagsOptions)
    queryClient.prefetchInfiniteQuery(getCurrentUserCollectionsOptions)
  },
})

function EditSnippetPage() {
  return <EditSnippetPageView />
}

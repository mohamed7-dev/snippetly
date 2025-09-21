import { queryClient } from '@/components/providers/tanstack-query-provider'
import { UpdateCollectionPageView } from '@/components/views/update-collection-page-view'
import { getCollectionQueryOptions } from '@/features/collections/lib/api'
import { getPopularTagsOptions } from '@/features/tags/lib/api'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/collections/$slug/edit',
)({
  component: UpdateCollectionPage,
  head: async ({ params }) => {
    const data = await queryClient.ensureQueryData(
      getCollectionQueryOptions(params.slug),
    )
    return {
      meta: [
        {
          name: 'description',
          content:
            data.data.description ??
            `Update Collection with title ${data.data.title}`,
        },
        {
          title: `Update ${data.data.title} Info`,
        },
      ],
    }
  },
  beforeLoad: async ({
    params: { slug },
    context: { queryClient, authContext },
  }) => {
    const { data } = await queryClient.ensureQueryData(
      getCollectionQueryOptions(slug),
    )
    const user = authContext?.getCurrentUser()
    if (user?.name !== data.creator.username) {
      throw redirect({
        to: '/profile/$name',
        params: { name: data.creator.username },
      })
    }
  },
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(getPopularTagsOptions)
  },
})

function UpdateCollectionPage() {
  return <UpdateCollectionPageView />
}

import { CreateCollectionPageView } from '@/components/views/create-collection-page-view'
import { getPopularTagsOptions } from '@/features/tags/lib/api'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

export const Route = createFileRoute('/(protected)/dashboard/collections/new')({
  component: RouteComponent,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  head: () => {
    return {
      meta: [
        {
          title: 'Create New Collection',
        },
      ],
    }
  },
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getPopularTagsOptions)
  },
})

function RouteComponent() {
  return <CreateCollectionPageView />
}

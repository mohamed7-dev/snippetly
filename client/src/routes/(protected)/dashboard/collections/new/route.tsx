import { PageLoader } from '@/components/loaders/page-loader'
import { CreateCollectionPageView } from '@/components/views/create-collection-page-view'
import { getPopularTagsOptions } from '@/features/tags/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/collections/new')({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getPopularTagsOptions)
  },
  errorComponent: ({ error }) => console.log(JSON.stringify(error)),
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
})

function RouteComponent() {
  return <CreateCollectionPageView />
}

import { getCollectionQueryOptions } from '@/features/collections/lib/api'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/collections/$slug',
)({
  component: CollectionLayout,
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    await queryClient.ensureQueryData(getCollectionQueryOptions(slug))
  },
})

function CollectionLayout() {
  return <Outlet />
}

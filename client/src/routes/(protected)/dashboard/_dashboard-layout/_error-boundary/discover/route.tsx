import { DiscoverPageView } from '@/components/views/discover-page-view'
import { discoverUsersQueryOptions } from '@/features/discover/lib/api'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const searchSchema = z.object({
  tab: z
    .enum(['developers', 'snippets', 'collections'])
    .default('developers')
    .catch('developers'),
})

export const Route = createFileRoute(
  '/(protected)/dashboard/_dashboard-layout/_error-boundary/discover',
)({
  component: DiscoverPage,
  validateSearch: searchSchema,
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchInfiniteQuery(discoverUsersQueryOptions)
  },
})

function DiscoverPage() {
  return <DiscoverPageView />
}

import { RequestPageView } from '@/components/views/request-page-view'
import { getCurrentUserInbox } from '@/features/user/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/_dashboard-layout/_error-boundary/requests',
)({
  component: RequestPage,
  head: () => {
    return {
      meta: [
        {
          title: 'Friendship Requests',
        },
      ],
    }
  },
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchInfiniteQuery(getCurrentUserInbox)
  },
})

function RequestPage() {
  return <RequestPageView />
}

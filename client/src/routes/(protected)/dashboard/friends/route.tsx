import { PageLoader } from '@/components/loaders/page-loader'
import { FriendsPageView } from '@/components/views/friends-page-view'
import { getCurrentUserFriends } from '@/features/user/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/friends')({
  component: FriendsPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureInfiniteQueryData(getCurrentUserFriends)
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  errorComponent: (err) => <>{JSON.stringify(err.error)}</>,
})

function FriendsPage() {
  return <FriendsPageView />
}

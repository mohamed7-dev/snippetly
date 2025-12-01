import { searchFilterSchema } from '@/components/filter-menu'
import { FriendsPageView } from '@/components/views/friends-page-view'
import { getCurrentUserFriends } from '@/features/user/lib/api'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

export const Route = createFileRoute('/(protected)/dashboard/friends')({
  component: FriendsPage,
  head: () => {
    return {
      meta: [
        {
          title: 'Friends',
        },
      ],
    }
  },
  validateSearch: searchFilterSchema.extend({
    tab: z.enum(['friends', 'snippets']).default('friends').catch('friends'),
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchInfiniteQuery(getCurrentUserFriends)
  },
})

function FriendsPage() {
  return <FriendsPageView />
}

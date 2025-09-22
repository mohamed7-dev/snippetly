import { queryClient } from '@/components/providers/tanstack-query-provider'
import { ProfilePageView } from '@/components/views/profile-page-view'
import { getUserSnippetsOptions } from '@/features/snippets/lib/api'
import { getUserProfile } from '@/features/user/lib/api'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const tabsSchema = z.object({
  tab: z
    .enum(['snippets', 'collections'])
    .default('snippets')
    .catch('snippets'),
})

export const Route = createFileRoute('/(public)/profile/$name')({
  component: ProfilePage,
  head: async ({ params }) => {
    const data = await queryClient.ensureQueryData(getUserProfile(params.name))
    return {
      meta: [
        {
          name: 'description',
          content:
            data.data.profile.bio ?? `${data.data.profile.fullName} profile`,
        },
        {
          title: data.data.profile.fullName,
        },
      ],
    }
  },
  validateSearch: tabsSchema,
  loader: async ({ context: { queryClient }, params: { name } }) => {
    queryClient.prefetchInfiniteQuery(getUserSnippetsOptions(name))
    await queryClient.ensureQueryData(getUserProfile(name))
  },
})

function ProfilePage() {
  return <ProfilePageView />
}

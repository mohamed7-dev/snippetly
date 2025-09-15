import { PageLoader } from '@/components/loaders/page-loader'
import { ProfilePageView } from '@/components/views/profile-page-view'
import { getProfileSnippetsOptions } from '@/features/snippets/lib/api'
import { getUserProfile } from '@/features/user/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/profile/$name')({
  component: ProfilePage,
  loader: async ({ context: { queryClient }, params: { name } }) => {
    await queryClient.ensureQueryData(getUserProfile(name))
    await queryClient.ensureInfiniteQueryData(getProfileSnippetsOptions(name))
  },
  pendingComponent: () => (
    <PageLoader containerProps={{ className: 'min-h-screen' }} />
  ),
  errorComponent: (err) => <>{JSON.stringify(err.error)}</>,
})

function ProfilePage() {
  return <ProfilePageView />
}

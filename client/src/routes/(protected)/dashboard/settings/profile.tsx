import { ProfileSettingsPageView } from '@/components/views/profile-settings-page-view'
import { getCurrentUserProfileOptions } from '@/features/user/lib/api'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/settings/profile')(
  {
    component: ProfileSettingsPage,
    beforeLoad: async ({ context: { queryClient, authContext } }) => {
      const { data } = await queryClient.ensureQueryData(
        getCurrentUserProfileOptions,
      )
      const user = authContext?.getCurrentUser()
      if (user?.name !== data.profile.username) {
        throw redirect({
          to: '/profile/$name',
          params: { name: data.profile.username },
        })
      }
    },
    loader: async ({ context: { queryClient } }) => {
      await queryClient.ensureQueryData(getCurrentUserProfileOptions)
    },
  },
)

function ProfileSettingsPage() {
  return <ProfileSettingsPageView />
}

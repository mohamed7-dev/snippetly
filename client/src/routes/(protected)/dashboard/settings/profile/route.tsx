import { ProfileSettingsPageView } from '@/components/views/profile-settings-page-view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/settings/profile')(
  {
    component: ProfileSettingsPage,
    head: () => {
      return {
        meta: [
          {
            title: 'Profile Settings',
          },
        ],
      }
    },
  },
)

function ProfileSettingsPage() {
  return <ProfileSettingsPageView />
}

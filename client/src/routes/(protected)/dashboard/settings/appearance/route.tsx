import { AppearanceSettingsPageView } from '@/components/views/appearance-page-view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/settings/appearance',
)({
  component: AppearanceSettingsPage,
  head: () => {
    return {
      meta: [
        {
          title: 'Appearance Settings',
        },
      ],
    }
  },
})

function AppearanceSettingsPage() {
  return <AppearanceSettingsPageView />
}

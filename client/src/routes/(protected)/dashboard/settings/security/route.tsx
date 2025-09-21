import { SecuritySettingsPageView } from '@/components/views/security-settings-page-view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/settings/security',
)({
  component: SecurityPage,
  head: () => {
    return {
      meta: [
        {
          title: 'Security Settings',
        },
      ],
    }
  },
})

function SecurityPage() {
  return <SecuritySettingsPageView />
}

import { createFileRoute } from '@tanstack/react-router'
import { SettingsLayout as SettingsLayoutImpl } from '@/features/app-shell/components/settings'
import { getCurrentUserProfileOptions } from '@/features/user/lib/api'

export const Route = createFileRoute('/(protected)/dashboard/settings')({
  component: SettingsLayout,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getCurrentUserProfileOptions)
  },
})

function SettingsLayout() {
  return <SettingsLayoutImpl />
}

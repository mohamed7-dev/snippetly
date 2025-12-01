import { MainContentHeader } from './main-content-header'
import { ThemeSettings } from './theme-settings'

export function AppearanceSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <MainContentHeader />
      <ThemeSettings />
    </div>
  )
}

import { MainContentHeader } from './main-content-header'
import { ProfileInfoSection } from './profile-info-section'

export function ProfileSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <MainContentHeader />
      <ProfileInfoSection />
    </div>
  )
}

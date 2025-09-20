import React from 'react'
import { MainContentHeader } from './main-content-header'
import { ProfileInfoSection } from './profile-info-section'
import { EmailField } from './email-field'
import { PasswordResetField } from './password-reset-field'
import { PageHeader } from './page-header'

export function ProfileSettingsPage() {
  return (
    <React.Fragment>
      <PageHeader />
      <main className="flex flex-col gap-6 container mx-auto px-6 py-8">
        <MainContentHeader />
        <ProfileInfoSection />
        <EmailField />
        <PasswordResetField />
      </main>
    </React.Fragment>
  )
}

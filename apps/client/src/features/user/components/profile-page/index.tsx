import React from 'react'
import { PageHeader } from './page-header'
import { ProfileInfo } from './profile-info'
import { StatsSection } from './stats-section'
import { TabsSection } from './tabs-section'

export function ProfilePage() {
  return (
    <React.Fragment>
      <PageHeader />
      <main className="flex flex-col gap-6 container mx-auto px-6 py-8">
        <ProfileInfo />
        <StatsSection />
        <TabsSection />
      </main>
    </React.Fragment>
  )
}

import { PageHeader } from './page-header'
import { MainContentHeader } from './main-content-header'
import { TabsSection } from './tabs-section'
import React from 'react'

export function FriendsPage() {
  return (
    <React.Fragment>
      <PageHeader />
      <main className="container mx-auto px-6 py-8">
        <MainContentHeader />
        <TabsSection />
      </main>
    </React.Fragment>
  )
}

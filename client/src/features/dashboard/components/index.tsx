import React from 'react'
import { MainContentHeader } from './main-content-header'
import { StatsSection } from './stats-section'
import { SnippetsSection } from './snippets-section'

export function DashboardPage() {
  return (
    <React.Fragment>
      <div className="mb-6">
        <MainContentHeader />
        {/* Stats Cards */}
        <StatsSection />
      </div>
      <SnippetsSection />
    </React.Fragment>
  )
}

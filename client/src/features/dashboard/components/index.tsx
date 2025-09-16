import React from 'react'
import { MainContentHeader } from './main-content-header'
import { StatsSection } from './stats-section'
import { SnippetsSection } from './snippets-section'
import { PageLoader } from '@/components/loaders/page-loader'

export function DashboardPage() {
  return (
    <React.Fragment>
      <div className="mb-6">
        <MainContentHeader />
        {/* Stats Cards */}
        <StatsSection />
      </div>
      <React.Suspense fallback={<PageLoader />}>
        <SnippetsSection />
      </React.Suspense>
    </React.Fragment>
  )
}

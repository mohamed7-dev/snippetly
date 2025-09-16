import { MainContentHeader } from './main-content-header'
import { StatsSection } from './stats-section'
import { CollectionsGridSection } from './collections-grid-section'
import React from 'react'
import { PageLoader } from '@/components/loaders/page-loader'

export function CollectionsPage() {
  return (
    <div className="p-6">
      <MainContentHeader />
      <React.Suspense fallback={<PageLoader />}>
        <StatsSection />
        <CollectionsGridSection />
      </React.Suspense>
    </div>
  )
}

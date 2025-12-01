import { MainContentHeader } from './main-content-header'
import { StatsSection } from './stats-section'
import { CollectionsGridSection } from './collections-grid-section'
import React from 'react'
import { PageLoader } from '@/components/loaders/page-loader'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback'

export function CollectionsPage() {
  return (
    <div className="p-0 lg:p-6">
      <MainContentHeader />
      <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
        <React.Suspense fallback={<PageLoader />}>
          <StatsSection />
          <CollectionsGridSection />
        </React.Suspense>
      </ErrorBoundary>
    </div>
  )
}

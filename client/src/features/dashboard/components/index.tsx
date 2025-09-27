import React from 'react'
import { MainContentHeader } from './main-content-header'
import { StatsSection } from './stats-section'
import { SnippetsSection } from './snippets-section'
import { PageLoader } from '@/components/loaders/page-loader'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback'

export function DashboardPage() {
  return (
    <React.Fragment>
      <div className="mb-6">
        <MainContentHeader />
        <StatsSection />
      </div>
      <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
        <React.Suspense fallback={<PageLoader />}>
          <SnippetsSection />
        </React.Suspense>
      </ErrorBoundary>
    </React.Fragment>
  )
}

import React from 'react'
import { CollectionPageHeader } from './collection-page-header'
import { MainContentHeader } from './main-content-header'
import { SnippetsGridSection } from './snippets-grid-section'
import { PageLoader } from '@/components/loaders/page-loader'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback'

export function CollectionPage() {
  return (
    <React.Fragment>
      <CollectionPageHeader />
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <MainContentHeader />
        <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
          <React.Suspense fallback={<PageLoader />}>
            <SnippetsGridSection />
          </React.Suspense>
        </ErrorBoundary>
      </main>
    </React.Fragment>
  )
}

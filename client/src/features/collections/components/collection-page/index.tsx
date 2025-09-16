import React from 'react'
import { CollectionPageHeader } from './collection-page-header'
import { MainContentHeader } from './main-content-header'
import { SnippetsGridSection } from './snippets-grid-section'
import { PageLoader } from '@/components/loaders/page-loader'

export function CollectionPage() {
  return (
    <React.Fragment>
      <CollectionPageHeader />
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <MainContentHeader />
        <React.Suspense fallback={<PageLoader />}>
          <SnippetsGridSection />
        </React.Suspense>
      </main>
    </React.Fragment>
  )
}

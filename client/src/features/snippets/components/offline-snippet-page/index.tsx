import React from 'react'
import { PageHeader } from './page-header'
import { SnippetSection } from './snippet-section'

export function OfflineSnippetPage() {
  return (
    <React.Fragment>
      <PageHeader />
      <main className="container mx-auto px-3 md:px-6 py-8 max-w-6xl">
        <SnippetSection />
      </main>
    </React.Fragment>
  )
}

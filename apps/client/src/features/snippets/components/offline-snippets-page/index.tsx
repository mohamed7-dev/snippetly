import React from 'react'
import { PageHeader } from './page-header'
import { SnippetsList } from './snippets-list'

export function OfflineSnippetsPage() {
  return (
    <React.Fragment>
      <PageHeader />
      <main className="container mx-auto px-3 md:px-6 py-8 max-w-6xl">
        <SnippetsList />
      </main>
    </React.Fragment>
  )
}

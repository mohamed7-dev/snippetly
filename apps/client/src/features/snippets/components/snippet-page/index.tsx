import React from 'react'
import { PageHeader } from './page-header'
import { MainContentHeader } from './main-content-header'
import { CodeBlock } from './code-block'
import { Sidebar } from './sidebar'
import { NotesCard } from './notes-card'

export function SnippetPage() {
  return (
    <React.Fragment>
      <PageHeader />
      <main className="container mx-auto px-3 md:px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <MainContentHeader />
            <CodeBlock />
            <NotesCard />
          </div>
          <Sidebar />
        </div>
      </main>
    </React.Fragment>
  )
}

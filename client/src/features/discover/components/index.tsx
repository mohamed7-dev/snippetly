import { MainContentHeader } from './main-content-header'
import { DiscoverTabs } from './discover-tabs'

export function DiscoverPage() {
  return (
    <main className="p-6 space-y-6">
      <MainContentHeader />
      <DiscoverTabs />
    </main>
  )
}

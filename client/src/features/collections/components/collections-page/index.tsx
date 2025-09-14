import { MainContentHeader } from './main-content-header'
import { StatsSection } from './stats-section'
import { CollectionsGridSection } from './collections-grid-section'

export function CollectionsPage() {
  return (
    <div className="p-6">
      <MainContentHeader />
      <StatsSection />
      <CollectionsGridSection />
    </div>
  )
}

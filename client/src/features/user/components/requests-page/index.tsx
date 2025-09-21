import { MainContentHeader } from './main-content-header'
import { StatsSection } from './stats-section'
import { TabsSection } from './tabs-section'

export function RequestPage() {
  return (
    <div className="space-y-6">
      <MainContentHeader />
      <StatsSection />
      <TabsSection />
    </div>
  )
}

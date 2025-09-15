import { MainContentHeader } from './main-content-header'
import { StatsSection } from './stats-section'
import { TabsSection } from './tabs-section'

export function RequestPage() {
  return (
    <main className="p-6 space-y-6">
      <MainContentHeader />
      <StatsSection />
      <TabsSection />
    </main>
  )
}

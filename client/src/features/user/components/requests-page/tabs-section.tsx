import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InboxTabContent } from './inbox-tab-content'
import { OutboxTabContent } from './outbox-tab-content'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'

export function TabsSection() {
  const {
    data: { stats },
  } = useSuspenseQuery(getCurrentUserDashboardOptions)

  return (
    <Tabs defaultValue="incoming">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="incoming">
          Incoming ({stats.friendsInboxCount})
        </TabsTrigger>
        <TabsTrigger value="sent">
          Sent ({stats.friendsOutboxCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="incoming" className="space-y-4">
        <InboxTabContent />
      </TabsContent>

      <TabsContent value="sent" className="space-y-4">
        <OutboxTabContent />
      </TabsContent>
    </Tabs>
  )
}

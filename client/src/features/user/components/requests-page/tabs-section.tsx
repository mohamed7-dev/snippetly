import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InboxTabContent } from './inbox-tab-content'
import { OutboxTabContent } from './outbox-tab-content'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'
import React from 'react'
import { PageLoader } from '@/components/loaders/page-loader'

export function TabsSection() {
  const { data } = useSuspenseQuery(getCurrentUserDashboardOptions)
  const stats = data.data.stats
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
        <React.Suspense fallback={<PageLoader />}>
          <InboxTabContent />
        </React.Suspense>
      </TabsContent>

      <TabsContent value="sent" className="space-y-4">
        <OutboxTabContent />
      </TabsContent>
    </Tabs>
  )
}

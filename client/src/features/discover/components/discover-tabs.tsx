import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersTabContent } from './users-tab-content'
import { SnippetsTabContent } from './snippets-tab-content'
import { CollectionsTabContent } from './collections-tab-content'
import React from 'react'
import { PageLoader } from '@/components/loaders/page-loader'

export function DiscoverTabs() {
  return (
    <Tabs defaultValue="users">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="users">Developers</TabsTrigger>
        <TabsTrigger value="snippets">Trending Snippets</TabsTrigger>
        <TabsTrigger value="collections">Collections</TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="space-y-4">
        <React.Suspense fallback={<PageLoader />}>
          <UsersTabContent />
        </React.Suspense>
      </TabsContent>
      <TabsContent value="snippets" className="space-y-4">
        <React.Suspense fallback={<PageLoader />}>
          <SnippetsTabContent />
        </React.Suspense>
      </TabsContent>

      <TabsContent value="collections" className="space-y-4">
        <CollectionsTabContent />
      </TabsContent>
    </Tabs>
  )
}

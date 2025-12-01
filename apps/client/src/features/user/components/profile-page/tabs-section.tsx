import { SnippetsTabContent } from './snippets-tab-content'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollectionsTabContent } from './collections-tab-content'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getUserProfile } from '../../lib/api'
import React from 'react'
import { PageLoader } from '@/components/loaders/page-loader'

export function TabsSection() {
  const { name } = useParams({ from: '/(public)/profile/$name' })
  const { data } = useSuspenseQuery(getUserProfile(name))
  const stats = data.data.stats

  const { tab } = useSearch({ from: '/(public)/profile/$name' })
  const navigate = useNavigate()
  return (
    <Tabs defaultValue="snippets" value={tab}>
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger
          value="snippets"
          onClick={() => navigate({ to: '.', search: { tab: 'snippets' } })}
        >
          Snippets ({stats.snippetsCount})
        </TabsTrigger>
        <TabsTrigger
          value="collections"
          onClick={() => navigate({ to: '.', search: { tab: 'collections' } })}
        >
          Collections ({stats.collectionsCount})
        </TabsTrigger>
      </TabsList>

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

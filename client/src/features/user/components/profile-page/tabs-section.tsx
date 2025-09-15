import { SnippetsTabContent } from './snippets-tab-content'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollectionsTabContent } from './collections-tab-content'
import { useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getUserProfile } from '../../lib/api'

export function TabsSection() {
  const { name } = useParams({ from: '/(public)/profile/$name' })
  const { data } = useSuspenseQuery(getUserProfile(name))
  const stats = data.stats
  return (
    <Tabs defaultValue="snippets">
      <TabsList>
        <TabsTrigger value="snippets">
          Snippets ({stats.snippetsCount})
        </TabsTrigger>
        <TabsTrigger value="collections">
          Collections ({stats.collectionsCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="snippets" className="space-y-4">
        <SnippetsTabContent />
      </TabsContent>

      <TabsContent value="collections" className="space-y-4">
        <CollectionsTabContent />
      </TabsContent>
    </Tabs>
  )
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FriendsTabContent } from './friends-tab-content'
import { FriendsSnippetsTabContent } from './friends-snippets-tab-content'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { getCurrentUserFriends } from '../../lib/api'

export function TabsSection() {
  const { data } = useSuspenseInfiniteQuery(getCurrentUserFriends)
  const total = data.pages?.[0].total
  return (
    <Tabs defaultValue="friends" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="friends">My Friends ({total})</TabsTrigger>
        <TabsTrigger value="snippets">Friends' Snippets</TabsTrigger>
      </TabsList>

      <TabsContent value="friends" className="space-y-6">
        <FriendsTabContent />
      </TabsContent>

      <TabsContent value="snippets" className="space-y-6">
        <FriendsSnippetsTabContent />
      </TabsContent>
    </Tabs>
  )
}

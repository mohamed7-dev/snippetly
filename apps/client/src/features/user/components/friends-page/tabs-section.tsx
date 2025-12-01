import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FriendsTabContent } from './friends-tab-content'
import { FriendsSnippetsTabContent } from './friends-snippets-tab-content'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { getCurrentUserFriends } from '../../lib/api'
import React from 'react'
import { PageLoader } from '@/components/loaders/page-loader'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback'

export function TabsSection() {
  const { tab } = useSearch({ from: '/(protected)/dashboard/friends' })
  const navigate = useNavigate()
  const { data } = useSuspenseInfiniteQuery(getCurrentUserFriends)
  const total = data.pages?.[0].total

  return (
    <Tabs defaultValue="friends" value={tab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="friends"
          onClick={() => navigate({ to: '.', search: { tab: 'friends' } })}
        >
          My Friends ({total})
        </TabsTrigger>
        <TabsTrigger
          value="snippets"
          onClick={() => navigate({ to: '.', search: { tab: 'snippets' } })}
        >
          Friends' Snippets
        </TabsTrigger>
      </TabsList>

      <TabsContent value="friends" className="space-y-6">
        <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
          <React.Suspense fallback={<PageLoader />}>
            <FriendsTabContent />
          </React.Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="snippets" className="space-y-6">
        <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
          <React.Suspense fallback={<PageLoader />}>
            <FriendsSnippetsTabContent />
          </React.Suspense>
        </ErrorBoundary>
      </TabsContent>
    </Tabs>
  )
}

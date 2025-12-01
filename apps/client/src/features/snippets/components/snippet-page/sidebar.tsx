import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { CalendarIcon, GitForkIcon } from 'lucide-react'
import { getSnippetQueryOptions } from '../../lib/api'
import { useForkSnippet } from '../../hooks/use-fork-snippet'
import { LoadingButton } from '@/components/inputs/loading-button'
import { CurrentUserCollectionsOverlay } from '@/features/collections/components/current-user-collections-overlay'
import React from 'react'
import { toast } from 'sonner'

export function Sidebar() {
  const params = useParams({ from: '/(protected)/dashboard/snippets/$slug/' })

  const { data } = useSuspenseQuery(getSnippetQueryOptions(params.slug))
  const snippet = data.data

  // fork snippet
  const [isCollectionsOverlayOpen, setIsCollectionsOverlayOpen] =
    React.useState(false)

  const { onClick: fork, isPending: isForking } = useForkSnippet({
    onSuccess: (data) => {
      setIsCollectionsOverlayOpen(false)
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.response?.data.message)
    },
  })

  const handleForking = (collectionSlug?: string) => {
    if (!collectionSlug) {
      // at this point we are not authenticated so we need to redirect the user
      fork()
    } else {
      fork({ slug: snippet.publicId, collectionSlug: collectionSlug })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(snippet.addedAt).toLocaleDateString()}</span>
          </div>
          {snippet.lastUpdatedAt && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Updated:</span>
              <span>
                {new Date(snippet.lastUpdatedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <CurrentUserCollectionsOverlay
            Trigger={
              <LoadingButton
                isLoading={isForking}
                disabled={isForking}
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent"
              >
                <GitForkIcon className="h-4 w-4 mr-2" />
                Fork Snippet
              </LoadingButton>
            }
            onSelect={(publicId) => handleForking(publicId)}
            isOpen={isCollectionsOverlayOpen}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">
            Related Snippets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-4 text-muted-foreground text-sm">
            TODO: Get related snippets
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Button } from '@/components/ui/button'
import { Link, useLoaderData, useParams } from '@tanstack/react-router'
import { ArrowLeftIcon, EditIcon, LibraryIcon } from 'lucide-react'
import { CopyButton } from '../copy-button'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getSnippetQueryOptions } from '../../lib/api'
import { useAuth } from '@/features/auth/components/auth-provider'
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper'
import { addSavedSnippet } from '@/lib/offline-store'
import React from 'react'
import { toast } from 'sonner'

export function PageHeader() {
  const offlineSnippet = useLoaderData({
    from: '/(protected)/dashboard/snippets/$slug/',
  })
  const params = useParams({ from: '/(protected)/dashboard/snippets/$slug/' })
  const { data } = useSuspenseQuery(getSnippetQueryOptions(params.slug))
  const snippet = data.data
  const auth = useAuth()
  const user = auth?.getCurrentUser()

  // save offline snippet
  const handleSaveOffline = React.useCallback(async () => {
    await addSavedSnippet({
      ...snippet,
      creatorName: snippet.creator.username,
      tags: snippet.tags.map((tag) => tag.name),
    })
      .then(() => {
        toast.success('Snippet saved for offline')
      })
      .catch(() => {
        toast.error('Failed to save snippet for offline')
      })
  }, [snippet])

  return (
    <HeaderWrapper className="justify-between flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard" className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="w-full sm:w-auto flex items-center justify-center gap-3">
        <CopyButton code={snippet.code} />
        {!offlineSnippet && (
          <Button size="sm" onClick={handleSaveOffline}>
            <LibraryIcon className="h-4 w-4 mr-2" />
            Save For Offline
          </Button>
        )}
        {snippet.creator.username === user?.name && (
          <Button size="sm" asChild>
            <Link
              to={'/dashboard/snippets/$slug/edit'}
              params={{ slug: params.slug }}
              from="/dashboard/snippets/$slug/edit"
            >
              <EditIcon className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        )}
      </div>
    </HeaderWrapper>
  )
}

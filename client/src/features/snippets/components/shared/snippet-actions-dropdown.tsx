import { useDeleteConfirmation } from '@/components/providers/delete-confirmation-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/components/auth-provider'
import { CurrentUserCollectionsOverlay } from '@/features/collections/components/current-user-collections-overlay'
import { CopyButton } from '@/features/snippets/components/copy-button'
import { useCopyCode } from '@/features/snippets/hooks/use-copy-code'
import {
  useDeleteSnippet,
  type DeleteSnippetErrorRes,
  type DeleteSnippetSuccessRes,
} from '@/features/snippets/hooks/use-delete-snippet'
import {
  useForkSnippet,
  type ForkSnippetErrorRes,
  type ForkSnippetSuccessRes,
} from '@/features/snippets/hooks/use-fork-snippet'
import type { Snippet } from '@/features/snippets/lib/types'
import type { AsyncActionCallback } from '@/lib/types'
import { Link } from '@tanstack/react-router'
import {
  EditIcon,
  EyeIcon,
  GitForkIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

export interface SnippetActionsDropdownProps {
  snippet: Pick<Snippet, 'publicId' | 'code' | 'creatorName'>
  onCopy?: (code: string) => void
  deleteSnippet?: AsyncActionCallback<
    DeleteSnippetSuccessRes,
    DeleteSnippetErrorRes
  >
  forkSnippet?: AsyncActionCallback<ForkSnippetSuccessRes, ForkSnippetErrorRes>
  Trigger?: React.ReactNode
}
export function SnippetActionsDropdown({
  snippet,
  onCopy,
  deleteSnippet,
  forkSnippet,
  Trigger,
}: SnippetActionsDropdownProps) {
  const ctx = useAuth()
  const user = ctx?.getCurrentUser()
  const [open, setOpen] = React.useState(false)
  // copy
  const { copyCode } = useCopyCode({ code: snippet.code })
  const handleCopy = () => {
    copyCode()
    onCopy?.(snippet.code)
  }

  // fork
  const [isCollectionsOverlayOpen, setIsCollectionsOverlayOpen] =
    React.useState(false)
  const { onClick: fork, isPending: isForking } = useForkSnippet({
    ...forkSnippet,
    onSuccess: (data) => {
      setIsCollectionsOverlayOpen(false)
      toast.success(data.message)
      forkSnippet?.onSuccess?.(data)
      setOpen(false)
    },
    onError: (error) => {
      toast.error(error.response?.data.message)
      forkSnippet?.onError?.(error)
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

  // delete
  const { confirm, resetAndClose } = useDeleteConfirmation()
  const { mutateAsync: deleteSnippetAction, isPending: isDeleting } =
    useDeleteSnippet({
      ...deleteSnippet,
      onSuccess: (data) => {
        toast.success(data.message)
        deleteSnippet?.onSuccess?.(data)
        resetAndClose?.()
        setOpen(false)
      },
      onError: (error) => {
        toast.error(error.response?.data.message)
        deleteSnippet?.onError?.(error)
      },
    })

  const handleDeleting = async () => {
    confirm({
      title: 'Delete snippet',
      isPending: isDeleting,
      onConfirm: async () =>
        await deleteSnippetAction({ slug: snippet.publicId }),
    })
  }
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {Trigger ? (
          Trigger
        ) : (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <CopyButton
            code={snippet.code}
            variant={'ghost'}
            className="w-full justify-start"
            onClick={handleCopy}
          />
        </DropdownMenuItem>
        {!!user && (
          <CurrentUserCollectionsOverlay
            Trigger={
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                disabled={isForking}
                asChild
              >
                <Button
                  variant={'ghost'}
                  size={'sm'}
                  className="w-full justify-start"
                >
                  <GitForkIcon className="mr-2 h-4 w-4" />
                  Fork
                </Button>
              </DropdownMenuItem>
            }
            isOpen={isCollectionsOverlayOpen}
            onSelect={(slug) => handleForking(slug)}
            onOpenChange={(open) => setIsCollectionsOverlayOpen(open)}
          />
        )}
        {!!!user && (
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            disabled={isForking}
            asChild
          >
            <Button
              variant={'ghost'}
              size={'sm'}
              className="w-full justify-start"
              onClick={() => handleForking()}
            >
              <GitForkIcon className="mr-2 h-4 w-4" />
              Fork
            </Button>
          </DropdownMenuItem>
        )}
        {snippet.creatorName === user?.name && (
          <DropdownMenuItem asChild>
            <Button
              variant={'ghost'}
              size={'sm'}
              className="w-full justify-start"
              asChild
            >
              <Link
                to="/dashboard/snippets/$slug/edit"
                params={{ slug: snippet.publicId }}
                preload={false}
              >
                <EditIcon className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </DropdownMenuItem>
        )}

        {snippet.creatorName === user?.name && (
          <DropdownMenuItem asChild>
            <Button
              variant={'ghost'}
              size={'sm'}
              className="w-full justify-start"
              asChild
            >
              <Link
                to="/dashboard/snippets/$slug"
                params={{ slug: snippet.publicId }}
                preload={false}
              >
                <EyeIcon className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
          </DropdownMenuItem>
        )}
        {snippet.creatorName === user?.name && (
          <React.Fragment>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDeleting}
              disabled={isDeleting}
            >
              <Trash2Icon className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </React.Fragment>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

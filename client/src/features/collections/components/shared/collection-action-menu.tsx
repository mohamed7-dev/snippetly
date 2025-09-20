import {
  EditIcon,
  GitForkIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { clientRoutes } from '@/lib/routes'
import type { Collection } from '../../lib/types'
import {
  useForkCollection,
  type ForkCollectionErrorRes,
  type ForkCollectionSuccessRes,
} from '../../hooks/use-fork-collection'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useDeleteConfirmation } from '@/components/providers/delete-confirmation-provider'
import {
  useDeleteCollection,
  type DeleteCollectionErrorRes,
  type DeleteCollectionSuccessRes,
} from '../../hooks/use-delete-collection'
import type { AsyncActionCallback } from '@/lib/types'
import { toast } from 'sonner'

type CollectionActionMenuProps = {
  collection: Pick<Collection, 'publicId' | 'creatorName' | 'title'>
  deleteCollection?: AsyncActionCallback<
    DeleteCollectionSuccessRes,
    DeleteCollectionErrorRes
  >
  forkCollection?: AsyncActionCallback<
    ForkCollectionSuccessRes,
    ForkCollectionErrorRes
  >
}
export function CollectionActionMenu({
  collection,
  deleteCollection,
  forkCollection,
}: CollectionActionMenuProps) {
  const auth = useAuth()
  const user = auth.getCurrentUser()

  // fork
  const { mutateAsync: fork, isPending: isForking } = useForkCollection({
    ...forkCollection,
    onSuccess: (data) => {
      toast.success(data.message)
      forkCollection?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error(error.response?.data.message)
      forkCollection?.onError?.(error)
    },
  })
  const handleForking = async () => {
    await fork({ slug: collection.publicId })
  }

  // delete
  const { confirm } = useDeleteConfirmation()
  const { mutateAsync: deleteCollectionAction } = useDeleteCollection({
    ...deleteCollection,
    onSuccess: (data) => {
      toast.success(data.message)
      deleteCollection?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error(error.response?.data.message)
      deleteCollection?.onError?.(error)
    },
  })
  const handleDeletingCollection = () => {
    confirm({
      title: `Delete Collection ${collection.title}`,
      onConfirm: async () => {
        await deleteCollectionAction({ slug: collection.publicId })
      },
    })
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {collection.creatorName === user?.name && (
          <DropdownMenuItem asChild>
            <Link
              to={clientRoutes.editCollection}
              params={{ slug: collection.publicId }}
            >
              <EditIcon className="mr-2 h-4 w-4" />
              Edit Collection
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleForking} disabled={isForking}>
          <GitForkIcon className="mr-2 h-4 w-4" />
          Fork Collection
        </DropdownMenuItem>

        {collection.creatorName === user?.name && (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleDeletingCollection}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete Collection
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

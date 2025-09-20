import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useInfiniteQuery } from '@tanstack/react-query'
import React from 'react'
import { getCurrentUserCollectionsOptions } from '../../lib/api'
import { Button } from '@/components/ui/button'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'
import { BookOpenIcon, PlusIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { CollectionItem } from './collection-item'

export type CurrentUserCollectionsOverlayProps = {
  Trigger: React.ReactNode
  onSelect: (publicId: string) => void
  onOpenChange?: (open: boolean) => void
  isOpen: boolean
}
export function CurrentUserCollectionsOverlay({
  Trigger,
  onSelect,
  onOpenChange,
  isOpen,
}: CurrentUserCollectionsOverlayProps) {
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery(getCurrentUserCollectionsOptions)
  const collections = data?.pages?.flatMap((p) => p.items) ?? []
  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open)
  }
  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{Trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your Collections</AlertDialogTitle>
          <AlertDialogDescription>
            Pick one of these collections to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 md:max-h-[70vh] md:overflow-y-auto">
          {collections.map((collection) => (
            <CollectionItem
              collection={collection}
              onSelect={(publicId) => onSelect(publicId)}
              key={collection.publicId}
            />
          ))}
          <InfiniteLoader
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            Content={
              !collections?.length ? (
                <div className="text-center py-12">
                  <BookOpenIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    No collections yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first collection to organize your code snippets
                  </p>
                  <Button asChild>
                    <Link to={'/dashboard/collections/new'}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Collection
                    </Link>
                  </Button>
                </div>
              ) : null
            }
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant={'ghost'}>Cancel</Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

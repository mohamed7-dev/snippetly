import { Button } from '@/components/ui/button'
import type { Collection } from '../../lib/types'
import type { CurrentUserCollectionsOverlayProps } from '.'

type CollectionItemProps = {
  collection: Pick<Collection, 'color' | 'title' | 'publicId'> & {
    snippetsCount?: number
  }
  onSelect: CurrentUserCollectionsOverlayProps['onSelect']
}
export function CollectionItem({ collection, onSelect }: CollectionItemProps) {
  return (
    <article className="flex items-center justify-between px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
      <div className="flex items-center gap-3">
        <div
          className={`size-4 rounded-full`}
          style={{
            backgroundColor: collection.color,
          }}
        />
        <span className="flex-1">{collection.title}</span>
        <span>
          {collection.snippetsCount ?? 0} snippet
          {(collection.snippetsCount ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>
      <Button
        className="rounded-full"
        onClick={() => onSelect(collection.publicId)}
      >
        Select
      </Button>
    </article>
  )
}

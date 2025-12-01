import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import type { Collection } from '../../lib/types'
import type { Tag } from '@/features/tags/lib/types'
import type { Snippet } from '@/features/snippets/lib/types'
import {
  CollectionActionMenu,
  type CollectionActionMenuProps,
} from '../shared/collection-action-menu'

type CollectionCardProps = {
  collection: Pick<
    Collection,
    'publicId' | 'title' | 'color' | 'description' | 'creatorName'
  > &
    Partial<Pick<Collection, 'isPrivate' | 'lastUpdatedAt'>> & {
      tags: Pick<Tag, 'name'>[]
      snippets: Pick<Snippet, 'title' | 'language' | 'publicId'>[]
      snippetsCount: number
    }
} & Omit<CollectionActionMenuProps, 'collection'>

export function CollectionCard({ collection, ...props }: CollectionCardProps) {
  return (
    <Card
      key={collection.publicId}
      className="border-border hover:shadow-lg transition-shadow group"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-4 w-4 rounded-full`}
              style={{
                backgroundColor: collection.color,
              }}
            />
            <div className="flex-1">
              <CardTitle className="text-lg font-heading group-hover:text-primary transition-colors">
                <Link
                  to={'/dashboard/collections/$slug'}
                  params={{ slug: collection.publicId }}
                >
                  {collection.title}
                </Link>
              </CardTitle>
              <CardDescription className="mt-1 text-pretty">
                {collection.description}
              </CardDescription>
            </div>
          </div>
          <CollectionActionMenu collection={collection} {...props} />
        </div>

        <div className="flex items-center flex-wrap gap-4 sm:gap-2 mt-3">
          <Badge variant="outline" className="text-xs">
            {collection.snippetsCount} snippet
            {collection.snippetsCount !== 1 ? 's' : ''}
          </Badge>
          {!collection.isPrivate && (
            <Badge variant="secondary" className="text-xs">
              Public
            </Badge>
          )}
          {collection.lastUpdatedAt && (
            <span className="text-xs text-muted-foreground sm:ml-auto">
              Updated {new Date(collection.lastUpdatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          {collection.snippets?.slice(0, 3).map((snippet, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
              <span className="flex-1 truncate">{snippet.title}</span>
              <Badge variant="outline" className="text-xs font-mono">
                {snippet.language}
              </Badge>
            </div>
          ))}
          {collection.snippets?.length > 3 && (
            <div className="text-xs text-muted-foreground text-center pt-1">
              +{collection.snippetsCount - 3} more snippets
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {collection.tags.map((tag) => (
            <Badge key={tag.name} variant="outline" className="text-xs">
              #{tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

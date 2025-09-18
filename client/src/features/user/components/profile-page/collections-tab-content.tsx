import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProfileCollectionsOptions } from '@/features/collections/lib/api'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

export function CollectionsTabContent() {
  const { name } = useParams({ from: '/(public)/profile/$name' })
  const { data } = useSuspenseInfiniteQuery(getProfileCollectionsOptions(name))
  const collections = data.pages?.flatMap((p) => p.items) ?? []
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <Card
          key={collection.publicId}
          className="hover:shadow-md transition-shadow"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${collection.color}`} />
              <CardTitle className="text-lg">{collection.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {collection.description}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {collection.snippetsCount} snippet
                {collection.snippetsCount !== 1 ? 's' : ''}
              </span>
              <Badge variant={collection.isPrivate ? 'secondary' : 'default'}>
                {collection.isPrivate ? 'Private' : 'Public'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

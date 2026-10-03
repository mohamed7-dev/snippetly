import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiSuccess } from '@/lib/api-client';
import type { CollectionListDtoType } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { CollectionActionMenu } from '../shared/collection-action-menu';

interface CollectionCardProps {
    collection: ApiSuccess<CollectionListDtoType['output']>['items'][number];
}

export function CollectionCard({ collection }: CollectionCardProps) {
    const updatedAt = 'updatedAt' in collection ? collection.updatedAt : undefined;
    const isPrivate = 'isPrivate' in collection ? collection.isPrivate : false;
    return (
        <Card key={collection.id} className="border-border hover:shadow-lg transition-shadow group">
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
                            <CardTitle className="text-lg font-heading capitalize group-hover:text-primary transition-colors">
                                <Link to={'/dashboard/collections/$id'} params={{ id: collection.id }}>
                                    {collection.name}
                                </Link>
                            </CardTitle>
                            <CardDescription className="mt-1 text-pretty">
                                {collection.description}
                            </CardDescription>
                        </div>
                    </div>
                    <CollectionActionMenu collection={collection} />
                </div>

                <div className="flex items-center flex-wrap gap-4 sm:gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                        {collection.snippetCount} snippet
                        {collection.snippetCount !== 1 ? 's' : ''}
                    </Badge>
                    {!isPrivate && (
                        <Badge variant="secondary" className="text-xs">
                            Public
                        </Badge>
                    )}
                    {updatedAt && (
                        <span className="text-xs text-muted-foreground sm:ml-auto">
                            Updated {new Date(updatedAt).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {collection.snippets?.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {collection.snippets.map(snippet => (
                            <div key={snippet.id} className="flex items-center gap-2 text-sm">
                                <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                                <span className="flex-1 truncate">{snippet.name}</span>
                                <Badge variant="outline" className="text-xs font-mono">
                                    {snippet.language}
                                </Badge>
                            </div>
                        ))}
                        {collection.snippetCount > collection.snippets.length && (
                            <div className="text-xs text-muted-foreground text-center pt-1">
                                +{collection.snippetCount - collection.snippets.length} more snippets
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-1 flex-wrap">
                    {collection.tags?.map(tag => (
                        <Badge key={tag.value} variant="outline" className="text-xs">
                            #{tag.value}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

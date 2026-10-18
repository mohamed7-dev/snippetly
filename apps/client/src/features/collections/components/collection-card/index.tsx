import { DeveloperIdentity } from '@/components/shared/developer-identity';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiSuccess } from '@/lib/api-client';
import { type CollectionListDtoType } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { GitForkIcon } from 'lucide-react';
import { CollectionActionMenu, type CollectionActionMenuProps } from '../shared/collection-action-menu';

interface CollectionCardProps extends CollectionActionMenuProps {
    collection: ApiSuccess<CollectionListDtoType['output']>['items'][number];
}

export function CollectionCard({ collection, ...props }: CollectionCardProps) {
    const isPrivate = 'isPrivate' in collection ? collection.isPrivate : false;
    return (
        <Card key={collection.id} className="border-border hover:shadow-lg transition-shadow group">
            <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <div
                                className={`h-4 w-4 rounded-full`}
                                style={{
                                    backgroundColor: collection.color,
                                }}
                            />
                            <CardTitle className="text-lg font-heading capitalize group-hover:text-primary transition-colors">
                                <Link to={'/collections/$id'} params={{ id: collection.id }}>
                                    {collection.name}
                                </Link>
                            </CardTitle>
                        </div>
                        {collection.forkedFrom && (
                            <div
                                className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted/60 px-2 py-1 text-xs text-muted-foreground"
                                aria-label="Fork attribution"
                            >
                                <GitForkIcon className="size-3 shrink-0" aria-hidden="true" />
                                <Link
                                    to="/snippets/$id"
                                    params={{ id: collection.forkedFrom.id }}
                                    preload={false}
                                    className="max-w-36 truncate font-medium text-foreground/80 hover:text-primary"
                                    title={collection.forkedFrom.name}
                                >
                                    {collection.forkedFrom.name}
                                </Link>
                                <span aria-hidden="true">·</span>
                                <DeveloperIdentity
                                    developerInfo={collection.forkedFrom.creator}
                                    size={'xs'}
                                />
                            </div>
                        )}
                    </div>
                    <CollectionActionMenu collection={collection} {...props} />
                </div>

                {collection.description && (
                    <p className="text-sm text-muted-foreground text-pretty">{collection.description}</p>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <DeveloperIdentity developerInfo={collection.creator} />
                    <div className="flex items-center flex-wrap gap-4">
                        <Badge variant="outline" className="text-xs">
                            {collection.snippetCount} snippet
                            {collection.snippetCount !== 1 ? 's' : ''}
                        </Badge>
                        {!isPrivate && (
                            <Badge variant="secondary" className="text-xs">
                                Public
                            </Badge>
                        )}
                    </div>
                </div>
                {collection.snippets?.length > 0 ? (
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
                ) : (
                    <div className="mb-4 text-sm text-muted-foreground">
                        No snippets were added to the collection, yet!
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

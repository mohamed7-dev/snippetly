import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { ForkSnippetToCollection } from '@/features/snippet-fork/components/fork-snippet-to-collection';
import { Permission } from '@snippetly/common/dto';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { BookOpenIcon, CalendarIcon } from 'lucide-react';
import { getSnippetQueryOptions } from '../../lib/snippet-query-options';

export function SnippetPageSidebar() {
    const params = useParams({ from: '/(protected)/dashboard/snippets/$id/' });

    const { data: snippet } = useSuspenseQuery(getSnippetQueryOptions(params.id));
    const createdAt = 'createdAt' in snippet ? snippet.createdAt : undefined;
    const updatedAt = 'updatedAt' in snippet ? snippet.updatedAt : undefined;
    const collection = 'collection' in snippet ? snippet?.collection : undefined;
    return (
        <div className="space-y-6">
            <PermissionGuard
                requiredPermissions={[Permission.Authenticated, Permission.ReadSnippet, Permission.Owner]}
                ownerId={snippet.creator.id}
            >
                {(createdAt || updatedAt || collection) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-heading text-base">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {collection && (
                                <div className="flex items-center gap-2">
                                    <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Collection:</span>
                                    <Button variant={'link'} asChild>
                                        <Link to="/dashboard/collections/$id" params={{ id: collection.id }}>
                                            {collection.name}
                                        </Link>
                                    </Button>
                                </div>
                            )}
                            {createdAt && (
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Created:</span>
                                    <span>{new Date(createdAt).toLocaleDateString()}</span>
                                </div>
                            )}
                            {updatedAt && (
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Updated:</span>
                                    <span>{new Date(updatedAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </PermissionGuard>
            <PermissionGuard requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-heading text-base">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <ForkSnippetToCollection
                            snippetId={snippet.id}
                            triggerAs="button"
                            variant={'outline'}
                            selectedCollectionId={collection?.id}
                        />
                    </CardContent>
                </Card>
            </PermissionGuard>
            <Card>
                <CardHeader>
                    <CardTitle className="font-heading text-base">Related Snippets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        TODO: Get related snippets
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

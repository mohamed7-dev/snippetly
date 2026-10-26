import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { OnlineGuard } from '@/features/offline-snippet/components/shared/online-guard';
import { ForkSnippetToCollection } from '@/features/snippet-fork/components/fork-snippet-to-collection';
import { Permission } from '@snippetly/common/dto';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { BookOpenIcon, CalendarIcon } from 'lucide-react';
import { getRelatedSnippetsQueryOptions, getSnippetQueryOptions } from '../../lib/snippet-query-options';

export function SnippetPageSidebar() {
    const params = useParams({ from: '/(public)/snippets/$id' });

    const { data: snippet } = useSuspenseQuery(getSnippetQueryOptions(params.id));
    const {
        data: relatedSnippets,
        isError: isRelatedSnippetsError,
        isPending: isRelatedSnippetsPending,
    } = useQuery(getRelatedSnippetsQueryOptions(snippet.id));
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
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <BookOpenIcon className="size-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Collection:</span>
                                    </div>
                                    <Link
                                        to="/collections/$id"
                                        params={{ id: collection.id }}
                                        className="block font-medium truncate hover:text-primary"
                                    >
                                        {collection.name}
                                    </Link>
                                </div>
                            )}
                            {createdAt && (
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="size-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Created:</span>
                                    <span>{new Date(createdAt).toLocaleDateString()}</span>
                                </div>
                            )}
                            {updatedAt && (
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="size-4 text-muted-foreground" />
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
            <OnlineGuard>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-heading text-base">Related Snippets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isRelatedSnippetsPending ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                Loading suggestions...
                            </p>
                        ) : isRelatedSnippetsError ? (
                            <p role="alert" className="py-4 text-center text-sm text-destructive">
                                Unable to load related snippets.
                            </p>
                        ) : relatedSnippets?.items.length ? (
                            <div className="space-y-4 text-sm">
                                {relatedSnippets.items.map(relatedSnippet => (
                                    <div key={relatedSnippet.id} className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-muted-foreground/50" />
                                        <Link
                                            to="/snippets/$id"
                                            params={{ id: relatedSnippet.id }}
                                            preload={false}
                                            className="block font-medium truncate hover:text-primary"
                                        >
                                            {relatedSnippet.name}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No related snippets found.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </OnlineGuard>
        </div>
    );
}

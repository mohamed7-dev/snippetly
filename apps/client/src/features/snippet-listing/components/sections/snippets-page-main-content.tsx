import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { Permission } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { listCurrentUserSnippetsQueryOptions } from '../../lib/snippet-listing-query-options';

export function SnippetsPageMainContent() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        listCurrentUserSnippetsQueryOptions(),
    );
    const snippets = data.pages?.flatMap(page => page.items) ?? [];
    const ownerId = snippets?.[0]?.creator.id;
    const qClient = useQueryClient();
    const onDeleteSuccess = async () => {
        await qClient.invalidateQueries(listCurrentUserSnippetsQueryOptions());
    };

    return (
        <PermissionGuard
            requiredPermissions={[Permission.Authenticated, Permission.Owner, Permission.ReadSnippet]}
            ownerId={ownerId}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {snippets.map(snippets => (
                    <SnippetCard
                        key={snippets.id}
                        snippet={snippets}
                        deleteSnippet={{
                            onSuccess: onDeleteSuccess,
                        }}
                    />
                ))}
            </div>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                isManual={true}
                Content={
                    !snippets.length ? (
                        <StatusCard
                            variant="empty"
                            title="No snippets yet"
                            description="Create your first code snippet"
                            layout="section"
                            actions={
                                <Button asChild>
                                    <Link to={'/dashboard/snippets/new'}>
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Create Snippet
                                    </Link>
                                </Button>
                            }
                        />
                    ) : null
                }
            />
        </PermissionGuard>
    );
}

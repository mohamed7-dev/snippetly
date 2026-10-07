import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { Permission } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

export function InsightsPageSnippetsList() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        listCurrentUserSnippetsQueryOptions({ take: 5 }),
    );

    const snippets = data.pages.flatMap(p => p.items) ?? [];
    const ownerId = snippets?.[0]?.creator.id;
    const qClient = useQueryClient();

    const onMutateSnippetSuccess = async () => {
        await qClient.invalidateQueries(listCurrentUserSnippetsQueryOptions({ take: 5 }));
    };

    return (
        <PermissionGuard
            requiredPermissions={[Permission.Authenticated, Permission.Owner, Permission.ReadSnippet]}
            ownerId={ownerId}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {snippets?.map(snippet => (
                    <SnippetCard
                        key={snippet.id}
                        snippet={snippet}
                        deleteSnippet={{
                            onSuccess: onMutateSnippetSuccess,
                        }}
                        forkSnippet={{
                            onSuccess: onMutateSnippetSuccess,
                        }}
                    />
                ))}
            </div>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                Content={
                    !snippets.length ? (
                        <StatusCard
                            variant="empty"
                            title="No snippets yet"
                            description="Create your first code snippet to get started"
                            layout="section"
                            actions={
                                <Button asChild>
                                    <Link to="/dashboard/snippets/new">
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        <span>Create Snippet</span>
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

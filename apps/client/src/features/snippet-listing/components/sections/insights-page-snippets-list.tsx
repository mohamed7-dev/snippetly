import { StatusCard } from '@/components/feedback/status-card';
import { SnippetListLayout } from '@/components/shared/snippet-list-layout';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { Permission } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

export function InsightsPageSnippetsList() {
    const { data } = useSuspenseInfiniteQuery(listCurrentUserSnippetsQueryOptions({ take: 5 }));

    const snippets = data.pages.flatMap(p => p.items) ?? [];
    const qClient = useQueryClient();

    const onMutateSnippetSuccess = async (_data?: any, actionType?: 'add' | 'remove') => {
        if (actionType) {
            // TODO: update the cache manually
        } else {
            await qClient.invalidateQueries(listCurrentUserSnippetsQueryOptions());
        }
    };

    if (!snippets.length) {
        return (
            <StatusCard
                variant="empty"
                title="No snippets yet"
                description="Start creating your first snippet and you will see it here."
                layout="section"
                actions={[
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                        isAvailableOffline={true}
                    >
                        <Button variant={'default'} asChild>
                            <Link to="/dashboard/snippets/new">Create Snippet</Link>
                        </Button>
                    </PermissionGuard>,
                ]}
            />
        );
    }

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold font-heading">Recent Snippets</h2>
                <p className="text-muted-foreground">
                    A list of snippets that you have recently interacted with
                </p>
            </div>
            <SnippetListLayout>
                {snippets?.map(snippet => (
                    <PermissionGuard
                        key={snippet.id}
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.Owner,
                            Permission.ReadSnippet,
                        ]}
                        ownerId={snippet.creator.id}
                        isAvailableOffline={true}
                    >
                        <SnippetCard
                            snippet={snippet}
                            deleteSnippet={{
                                onSuccess: onMutateSnippetSuccess,
                            }}
                            forkSnippet={{
                                onSuccess: onMutateSnippetSuccess,
                            }}
                            moveSnippetToTrash={{
                                onSuccess: onMutateSnippetSuccess,
                            }}
                            addSnippetToFavourites={{
                                onSuccess: data => onMutateSnippetSuccess(data, 'add'),
                            }}
                            removeSnippetFromFavourites={{
                                onSuccess: data => onMutateSnippetSuccess(data, 'remove'),
                            }}
                        />
                    </PermissionGuard>
                ))}
            </SnippetListLayout>
        </section>
    );
}

import { StatusCard } from '@/components/feedback/status-card';
import { CreateSnippetIcon } from '@/components/shared/creation-icons';
import { SnippetListLayout } from '@/components/shared/snippet-list-layout';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import type { ApiSuccess } from '@/lib/api-client';
import { Permission, type CurrentUserSnippetListDtoType } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

export function InsightsPageSnippetsList() {
    const { data } = useSuspenseInfiniteQuery(listCurrentUserSnippetsQueryOptions({ take: 5 }));

    const snippets = data.pages.flatMap(p => p.items) ?? [];
    const qClient = useQueryClient();

    const onMutateSnippetSuccess = async () => {
        await qClient.invalidateQueries(listCurrentUserSnippetsQueryOptions());
    };

    const onFavRes = (snippetId: string, favAction: 'add' | 'remove', branch: 'success' | 'error') => {
        qClient.setQueriesData<InfiniteData<ApiSuccess<CurrentUserSnippetListDtoType['output']>>>(
            { queryKey: listCurrentUserSnippetsQueryOptions().queryKey },
            old => {
                if (!old) return;
                return {
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        items: page.items.map(item => {
                            if (snippetId === item.id) {
                                return {
                                    ...item,
                                    relationshipsWithCurrentUser: {
                                        ...item.relationshipsWithCurrentUser,
                                        isFavouritedByCurrentUser:
                                            favAction === 'add'
                                                ? branch === 'success'
                                                    ? true
                                                    : false
                                                : branch === 'success'
                                                  ? false
                                                  : true,
                                    },
                                };
                            }
                            return item;
                        }),
                    })),
                };
            },
        );
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
                            <Link to="/dashboard/snippets/new">
                                <CreateSnippetIcon className="mr-2 size-4" />
                                Create Snippet
                            </Link>
                        </Button>
                    </PermissionGuard>,
                ]}
            />
        );
    }

    return (
        <section className="space-y-6">
            <div className="space-y-1">
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
                                onSuccess: () => {
                                    onFavRes(snippet.id, 'add', 'success');
                                },
                                onError: () => {
                                    onFavRes(snippet.id, 'add', 'error');
                                },
                            }}
                            removeSnippetFromFavourites={{
                                onSuccess: () => {
                                    onFavRes(snippet.id, 'remove', 'success');
                                },
                                onError: () => {
                                    onFavRes(snippet.id, 'remove', 'error');
                                },
                            }}
                        />
                    </PermissionGuard>
                ))}
            </SnippetListLayout>
        </section>
    );
}

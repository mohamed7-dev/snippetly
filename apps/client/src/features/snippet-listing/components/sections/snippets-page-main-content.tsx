import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { SnippetListLayout } from '@/components/shared/snippet-list-layout';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import type { ApiSuccess } from '@/lib/api-client';
import { Permission, type CurrentUserSnippetListDtoType } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { Link, useSearch } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { listCurrentUserSnippetsQueryOptions } from '../../lib/snippet-listing-query-options';

export function SnippetsPageMainContent() {
    const search =
        useSearch({
            from: '/(protected)/dashboard/_dashboard-layout/snippets/',
        }) ?? {};
    const queryKeys = [search.sort, search.filter, search.filterOperator, search.tags];
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        listCurrentUserSnippetsQueryOptions(search, queryKeys),
    );
    const snippets = data.pages?.flatMap(page => page.items) ?? [];
    const qClient = useQueryClient();

    const onMutateSuccess = async () => {
        await qClient.invalidateQueries(listCurrentUserSnippetsQueryOptions(undefined, queryKeys));
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
                            if (item.id === snippetId) {
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

    return (
        <React.Fragment>
            <SnippetListLayout>
                {snippets.map(snippet => (
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
                            moveSnippetToTrash={{
                                onSuccess: onMutateSuccess,
                            }}
                            deleteSnippet={{
                                onSuccess: onMutateSuccess,
                            }}
                            forkSnippet={{
                                onSuccess: onMutateSuccess,
                            }}
                            addSnippetToFavourites={{
                                onSuccess: () => onFavRes(snippet.id, 'add', 'success'),
                                onError: () => onFavRes(snippet.id, 'add', 'error'),
                            }}
                            removeSnippetFromFavourites={{
                                onSuccess: () => onFavRes(snippet.id, 'remove', 'success'),
                                onError: () => onFavRes(snippet.id, 'remove', 'error'),
                            }}
                        />
                    </PermissionGuard>
                ))}
            </SnippetListLayout>
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
                                <PermissionGuard
                                    requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                                    isAvailableOffline={true}
                                >
                                    <Button asChild>
                                        <Link to={'/dashboard/snippets/new'}>
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Create Snippet
                                        </Link>
                                    </Button>
                                </PermissionGuard>
                            }
                        />
                    ) : null
                }
            />
        </React.Fragment>
    );
}

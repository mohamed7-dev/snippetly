import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { CreateSnippetIcon } from '@/components/shared/creation-icons';
import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { SnippetListLayout } from '@/components/shared/snippet-list-layout';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { discoverSnippetsQueryOptions } from '@/features/discover/lib/discover-query-options';
import { OnlineGuard } from '@/features/offline-snippet/components/shared/online-guard';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import type { ApiSuccess } from '@/lib/api-client';
import { Permission, snippetListDto, type SnippetListDtoType } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { listCurrentUserSnippetsQueryOptions } from '../../lib/snippet-listing-query-options';

export function DiscoverSnippetsList() {
    const { snippets: snippetsSearch } =
        useSearch({
            from: '/(public)/discover/',
        }) ?? {};
    const { sort, filter, filterOperator, tags } = snippetsSearch ?? {};
    const queryKeys = [sort, filter, filterOperator, tags];
    const navigate = useNavigate();
    const qClient = useQueryClient();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        discoverSnippetsQueryOptions({ sort, filter, filterOperator, tags }, queryKeys),
    );

    const snippets = data.pages?.flatMap(p => p.items) ?? [];

    const availableTags = [...new Set(snippets.flatMap(snippet => snippet.tags ?? []).map(tag => tag.value))];

    const onSnippetMutateSuccess = () => {
        qClient.invalidateQueries(listCurrentUserSnippetsQueryOptions());
    };

    const onFavRes = (snippetId: string, favAction: 'add' | 'remove', branch: 'success' | 'error') => {
        qClient.setQueriesData<InfiniteData<ApiSuccess<SnippetListDtoType['output']>>>(
            { queryKey: discoverSnippetsQueryOptions().queryKey },
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
        <div className="space-y-6">
            <OnlineGuard>
                <div className="flex items-center flex-wrap gap-3">
                    <FilterQueryDialog
                        schema={snippetListDto.input.shape.filter}
                        value={{ filter, filterOperator }}
                        onApply={val =>
                            navigate({
                                to: '.',
                                search: prev => ({
                                    ...prev,
                                    snippets: { ...prev?.snippets, ...val },
                                }),
                            })
                        }
                    />
                    <SortQueryDialog
                        sortSchema={snippetListDto.input.shape.sort}
                        value={{ sort }}
                        onApply={val =>
                            navigate({
                                to: '.',
                                search: prev => ({
                                    ...prev,
                                    snippets: { ...prev?.snippets, sort: val.sort },
                                }),
                            })
                        }
                    />
                    <TagFilterBar
                        tags={availableTags}
                        selectedTags={tags?.values ?? []}
                        operator={tags?.operator}
                        onChange={(values, operator) =>
                            navigate({
                                to: '.',
                                search: previous => ({
                                    ...previous,
                                    snippets: {
                                        ...previous?.snippets,
                                        tags: values.length ? { values, operator } : undefined,
                                    },
                                }),
                            })
                        }
                    />
                </div>
            </OnlineGuard>
            <SnippetListLayout>
                {snippets.map(snippet => (
                    <SnippetCard
                        key={snippet.id}
                        snippet={snippet}
                        forkSnippet={{ onSuccess: onSnippetMutateSuccess }}
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
                ))}
            </SnippetListLayout>
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
                                <PermissionGuard
                                    requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                                >
                                    <Button asChild>
                                        <Link to="/dashboard/snippets/new">
                                            <CreateSnippetIcon className="size-4" />
                                            <span>Create Snippet</span>
                                        </Link>
                                    </Button>
                                </PermissionGuard>
                            }
                        />
                    ) : null
                }
            />
        </div>
    );
}

import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { SnippetListLayout } from '@/components/shared/snippet-list-layout';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import {
    listCollectionSnippetsQueryOptions,
    listCurrentUserSnippetsQueryOptions,
} from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { Permission, snippetListDto } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { Code2Icon, PlusIcon } from 'lucide-react';

export function CollectionPageSnippetsList() {
    const params = useParams({
        from: '/(protected)/dashboard/collections/$id/',
    });
    const { filter, sort, filterOperator } = useSearch({ from: '/(protected)/dashboard/collections/$id/' });
    const navigate = useNavigate();
    const queryKeys = [filter, sort, filterOperator];
    // snippets
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        listCollectionSnippetsQueryOptions(params.id, { filter, sort, filterOperator }, queryKeys),
    );

    const snippets = data.pages.flatMap(page => page.items) ?? [];
    const total = data.pages[0]?.itemsCount ?? 0;

    const qClient = useQueryClient();

    const onSnippetMutationSuccess = () => {
        qClient.invalidateQueries(listCollectionSnippetsQueryOptions(params.id, undefined, queryKeys));
        qClient.invalidateQueries(listCurrentUserSnippetsQueryOptions());
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-xl">Snippets ({total})</h2>
                <div className="flex items-center gap-2">
                    <FilterQueryDialog
                        schema={snippetListDto.input.shape.filter}
                        value={{ filter }}
                        onApply={val => navigate({ to: '.', search: prev => ({ ...prev, filter: val }) })}
                    />
                    <SortQueryDialog
                        sortSchema={snippetListDto.input.shape.sort}
                        value={{ sort }}
                        onApply={val => navigate({ to: '.', search: prev => ({ ...prev, sort: val.sort }) })}
                    />
                </div>
            </div>

            <SnippetListLayout className="xl:grid-cols-2">
                {snippets.map(snippet => (
                    <PermissionGuard
                        key={snippet.id}
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.ReadSnippet,
                            Permission.Owner,
                        ]}
                        ownerId={snippet.creator.id}
                    >
                        <SnippetCard
                            snippet={snippet}
                            deleteSnippet={{
                                onSuccess: onSnippetMutationSuccess,
                            }}
                            forkSnippet={{
                                onSuccess: onSnippetMutationSuccess,
                            }}
                            moveSnippetToTrash={{
                                onSuccess: onSnippetMutationSuccess,
                            }}
                        />
                    </PermissionGuard>
                ))}
            </SnippetListLayout>
            <InfiniteLoader
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={() => {
                    void fetchNextPage();
                }}
                Content={
                    !snippets?.length ? (
                        <div className="text-center py-12">
                            <Code2Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-heading font-semibold text-lg mb-2">
                                No snippets in this collection
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Add your first snippet to get started
                            </p>
                            <PermissionGuard
                                requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                            >
                                <Button asChild>
                                    <Link to="/dashboard/snippets/new">
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Add Snippet
                                    </Link>
                                </Button>
                            </PermissionGuard>
                        </div>
                    ) : null
                }
            />
        </div>
    );
}

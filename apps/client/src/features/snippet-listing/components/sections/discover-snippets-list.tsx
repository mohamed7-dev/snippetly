import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { SnippetListLayout } from '@/components/shared/snippet-list-layout';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { Button } from '@/components/ui/button';
import { discoverSnippetsQueryOptions } from '@/features/discover/lib/discover-query-options';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { snippetListDto } from '@snippetly/common/dto';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

export function DiscoverSnippetsList() {
    const { snippets: snippetsSearch } = useSearch({
        from: '/(public)/discover/',
    });
    const { sort, filter, filterOperator, tags } = snippetsSearch ?? {};
    const queryKeys = [sort, filter, filterOperator, tags];
    const navigate = useNavigate();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        discoverSnippetsQueryOptions({ sort, filter, filterOperator, tags }, queryKeys),
    );

    const snippets = data.pages?.flatMap(p => p.items) ?? [];

    const availableTags = [...new Set(snippets.flatMap(snippet => snippet.tags ?? []).map(tag => tag.value))];
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <FilterQueryDialog
                    schema={snippetListDto.input.shape.filter}
                    value={{ filter, filterOperator }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({
                                ...prev,
                                snippets: { ...prev.snippets, ...val },
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
                                snippets: { ...prev.snippets, sort: val.sort },
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
                                    ...previous.snippets,
                                    tags: values.length ? { values, operator } : undefined,
                                },
                            }),
                        })
                    }
                />
            </div>
            <SnippetListLayout>
                {snippets.map(snippet => (
                    <SnippetCard key={snippet.id} snippet={snippet} />
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
        </div>
    );
}

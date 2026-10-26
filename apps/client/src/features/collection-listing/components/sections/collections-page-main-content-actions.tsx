import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { OnlineGuard } from '@/features/offline-snippet/components/shared/online-guard';
import { currentUserCollectionListDto } from '@snippetly/common/dto';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';

export function CollectionsPageMainContentActions() {
    const search = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/collections/',
    });
    const { sort, filter, filterOperator, tags } = search ?? {};
    const navigate = useNavigate();
    const queryKey = [sort, filter, filterOperator, tags];
    const { data } = useInfiniteQuery(
        listCurrentUserCollectionsQueryOptions({ sort, filter, filterOperator, tags }, queryKey),
    );

    const availableTags = [
        ...new Set(
            (data?.pages ?? []).flatMap(page =>
                page.items.flatMap(collection => collection.tags ?? []).map(tag => tag.value),
            ),
        ),
    ];

    return (
        <OnlineGuard>
            <div className="flex items-center flex-wrap gap-2">
                <FilterQueryDialog
                    schema={currentUserCollectionListDto.input.shape.filter}
                    value={{ filter, filterOperator }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: previous => ({ ...previous, ...val }),
                        })
                    }
                />
                <SortQueryDialog
                    sortSchema={currentUserCollectionListDto.input.shape.sort}
                    value={{ sort }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: previous => ({ ...previous, sort: val.sort }),
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
                                tags: values.length ? { values, operator } : undefined,
                            }),
                        })
                    }
                />
            </div>
        </OnlineGuard>
    );
}

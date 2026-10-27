import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { OnlineGuard } from '@/features/offline-snippet/components/shared/online-guard';
import { currentUserSnippetListDto, Permission } from '@snippetly/common/dto';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { listCurrentUserSnippetsQueryOptions } from '../../lib/snippet-listing-query-options';

export function SnippetsPageContentActions() {
    const search = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/snippets/',
    });
    const { sort, filter, filterOperator, tags } = search ?? {};
    const navigate = useNavigate();
    const queryKey = [sort, filter, filterOperator, tags];

    const { data } = useSuspenseInfiniteQuery(
        listCurrentUserSnippetsQueryOptions({ sort, filter, filterOperator, tags }, queryKey),
    );

    const availableTags = [
        ...new Set(
            data.pages.flatMap(page => page.items.flatMap(snippet => snippet.tags).map(tag => tag.value)),
        ),
    ];

    return (
        <OnlineGuard>
            <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                <div className="flex items-center flex-wrap gap-2">
                    <FilterQueryDialog
                        schema={currentUserSnippetListDto.input.shape.filter}
                        value={{ filter, filterOperator }}
                        onApply={val => {
                            navigate({
                                to: '.',
                                search: previous => ({ ...previous, ...val }),
                            });
                        }}
                    />
                    <SortQueryDialog
                        sortSchema={currentUserSnippetListDto.input.shape.sort}
                        value={{ sort }}
                        onApply={val => {
                            navigate({
                                to: '.',
                                search: previous => ({ ...previous, sort: val.sort }),
                            });
                        }}
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
            </PermissionGuard>
        </OnlineGuard>
    );
}

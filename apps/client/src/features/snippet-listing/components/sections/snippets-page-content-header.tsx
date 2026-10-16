import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { currentUserSnippetListDto, Permission } from '@snippetly/common/dto';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { listCurrentUserSnippetsQueryOptions } from '../../lib/snippet-listing-query-options';

export function SnippetsPageContentHeader() {
    const search = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_boundary/snippets/',
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
        <div className="space-y-8 mb-8">
            <div>
                <h1 className="font-heading font-bold text-3xl mb-2">My Snippets</h1>
                <p className="text-muted-foreground text-lg">Keep your code snippets in one place</p>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
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
                <div className="flex items-center gap-3">
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                    >
                        <Button asChild>
                            <Link to={'/dashboard/snippets/new'}>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                <span>New Snippet</span>
                            </Link>
                        </Button>
                    </PermissionGuard>
                </div>
            </div>
        </div>
    );
}

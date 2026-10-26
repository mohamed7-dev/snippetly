import { SectionLoader } from '@/components/feedback/section-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OfflineSearchBar } from '@/features/offline-snippet/components/shared/offline-search-bar';
import { OfflineSnippetCard } from '@/features/offline-snippet/components/shared/offline-snippet-card';
import { useOfflineCollectionStore } from '@/features/offline-snippet/hooks/use-offline-collection-store';
import { useOfflineSnippetStore } from '@/features/offline-snippet/hooks/use-offline-snippet-store';
import { getOfflineSnippetItems } from '@/features/offline-snippet/lib/offline-snippet-items';
import {
    OFFLINE_SNIPPET_SORT_ORDERS,
    type OfflineSnippetsSearchParams,
} from '@/features/offline-snippet/lib/offline-snippets-search';
import { FilterGroupOperator } from '@snippetly/common/dto';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';

const PAGE_SIZE = 6;
type SortOrder = (typeof OFFLINE_SNIPPET_SORT_ORDERS)[number];

const sortOptions: { value: SortOrder; label: string }[] = [
    { value: 'newest', label: 'Recently saved' },
    { value: 'oldest', label: 'Oldest saved' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
];

type OfflineSnippetsListingProps = {
    searchParams: OfflineSnippetsSearchParams;
    onSearchParamsChange: (updates: Partial<OfflineSnippetsSearchParams>) => void;
    onCountsChange: (counts: { filtered: number; total: number }) => void;
};

export function OfflineSnippetsListing({
    searchParams,
    onSearchParamsChange,
    onCountsChange,
}: OfflineSnippetsListingProps) {
    const {
        list: { data: savedSnippets, isPending: snippetsPending },
    } = useOfflineSnippetStore();
    const {
        list: { data: savedCollections, isPending: collectionsPending },
    } = useOfflineCollectionStore();
    const search = searchParams.search ?? '';
    const selectedTags = searchParams.tags ?? [];
    const tagOperator = searchParams.tagOperator ?? FilterGroupOperator.AND;
    const sortOrder = searchParams.sort ?? 'newest';
    const page = searchParams.page ?? 1;
    const snippets = useMemo(
        () => getOfflineSnippetItems(savedCollections ?? [], savedSnippets ?? []),
        [savedCollections, savedSnippets],
    );
    const availableTags = useMemo(
        () =>
            [...new Set(snippets.flatMap(snippet => snippet.tags.map(tag => tag.value)))].sort((a, b) =>
                a.localeCompare(b),
            ),
        [snippets],
    );
    const filteredSnippets = useMemo(() => {
        const searchTerm = search.trim().toLocaleLowerCase();
        const filtered = snippets.filter(snippet => {
            const tags = snippet.tags.map(tag => tag.value);
            if (
                selectedTags.length &&
                (tagOperator === FilterGroupOperator.AND
                    ? !selectedTags.every(tag => tags.includes(tag))
                    : !selectedTags.some(tag => tags.includes(tag)))
            ) {
                return false;
            }

            return (
                !searchTerm ||
                [snippet.name, snippet.description ?? '', snippet.code, snippet.language]
                    .join(' ')
                    .toLocaleLowerCase()
                    .includes(searchTerm)
            );
        });
        return filtered.sort((a, b) => {
            if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
            if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
            const difference = new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
            return sortOrder === 'newest' ? -difference : difference;
        });
    }, [search, selectedTags, snippets, sortOrder, tagOperator]);
    const pageCount = Math.max(1, Math.ceil(filteredSnippets.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleSnippets = filteredSnippets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const setSearch = (value: string) =>
        onSearchParamsChange({ search: value || undefined, page: undefined });

    useEffect(() => {
        if (!snippetsPending && !collectionsPending) {
            onCountsChange({ filtered: filteredSnippets.length, total: snippets.length });
        }
    }, [collectionsPending, filteredSnippets.length, onCountsChange, snippets.length, snippetsPending]);

    if (snippetsPending || collectionsPending) {
        return <SectionLoader message="Loading offline snippets..." />;
    }

    return (
        <section className="space-y-6">
            <div className="space-y-4 rounded-2xl border bg-linear-to-br from-primary/10 via-card to-card p-5 sm:p-7">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1fr)_minmax(11rem,0.65fr)_minmax(11rem,0.65fr)]">
                    <OfflineSearchBar
                        label="Search offline snippets"
                        placeholder="Search snippets..."
                        value={search}
                        onChange={setSearch}
                    />
                    <Select
                        value={sortOrder}
                        onValueChange={value => {
                            const selected = sortOptions.find(option => option.value === value);
                            if (selected) {
                                onSearchParamsChange({
                                    sort: selected.value === 'newest' ? undefined : selected.value,
                                    page: undefined,
                                });
                            }
                        }}
                    >
                        <SelectTrigger aria-label="Sort offline snippets" className="w-full bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {availableTags.length > 0 && (
                    <div className="border-t border-border/70 pt-4">
                        <TagFilterBar
                            tags={availableTags}
                            selectedTags={selectedTags}
                            operator={tagOperator}
                            onChange={(tags, operator) => {
                                onSearchParamsChange({
                                    tags: tags.length ? tags : undefined,
                                    tagOperator:
                                        tags.length > 1 && operator !== FilterGroupOperator.AND
                                            ? operator
                                            : undefined,
                                    page: undefined,
                                });
                            }}
                        />
                    </div>
                )}
            </div>

            {visibleSnippets.length ? (
                <>
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleSnippets.map(snippet => (
                            <li key={snippet.id}>
                                <OfflineSnippetCard snippet={snippet} />
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                            {Math.min(currentPage * PAGE_SIZE, filteredSnippets.length)} of{' '}
                            {filteredSnippets.length}
                        </p>
                        <nav aria-label="Offline snippets pages" className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                aria-label="Previous page"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    onSearchParamsChange({
                                        page: currentPage > 2 ? currentPage - 1 : undefined,
                                    })
                                }
                            >
                                <ArrowLeftIcon />
                                Previous
                            </Button>
                            <span className="min-w-20 text-center text-sm text-muted-foreground">
                                Page {currentPage} of {pageCount}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                aria-label="Next page"
                                disabled={currentPage === pageCount}
                                onClick={() => onSearchParamsChange({ page: currentPage + 1 })}
                            >
                                Next
                                <ArrowRightIcon />
                            </Button>
                        </nav>
                    </div>
                </>
            ) : (
                <StatusCard
                    variant="empty"
                    title={snippets.length ? 'No matching snippets' : 'No offline snippets yet'}
                    description={
                        snippets.length
                            ? 'Try another search or adjust the filters to see your saved snippets.'
                            : 'Save individual snippets or collections to access snippets offline.'
                    }
                    layout="section"
                    actions={
                        snippets.length ? (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onSearchParamsChange({
                                        search: undefined,
                                        tags: undefined,
                                        tagOperator: undefined,
                                        page: undefined,
                                    });
                                }}
                            >
                                Clear filters
                            </Button>
                        ) : undefined
                    }
                />
            )}
        </section>
    );
}

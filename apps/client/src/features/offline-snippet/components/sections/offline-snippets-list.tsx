import { SectionLoader } from '@/components/feedback/section-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOfflineSnippetStore } from '@/features/offline-snippet/hooks/use-offline-snippet-store';
import type { OfflineSnippetItem } from '@/features/offline-snippet/lib/store';
import { FilterGroupOperator } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CalendarClockIcon,
    Code2Icon,
    FolderIcon,
    SearchIcon,
} from 'lucide-react';
import React from 'react';

const PAGE_SIZE = 6;
const ALL_COLLECTIONS = 'all';
const NO_COLLECTION = 'none';
const collectionOption = (name: string) => `collection:${name}`;

type SortOrder = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

const sortOptions: { value: SortOrder; label: string }[] = [
    { value: 'newest', label: 'Recently saved' },
    { value: 'oldest', label: 'Oldest saved' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
];

export function OfflineSnippetsList() {
    const {
        list: { data, isPending },
    } = useOfflineSnippetStore();
    const [search, setSearch] = React.useState('');
    const [collection, setCollection] = React.useState(ALL_COLLECTIONS);
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
    const [tagOperator, setTagOperator] = React.useState(FilterGroupOperator.AND);
    const [sortOrder, setSortOrder] = React.useState<SortOrder>('newest');
    const [page, setPage] = React.useState(1);

    const snippets = data ?? [];
    const collections = React.useMemo(
        () =>
            [
                ...new Set(
                    snippets.flatMap(snippet => (snippet.collection?.name ? [snippet.collection.name] : [])),
                ),
            ].sort((a, b) => a.localeCompare(b)),
        [snippets],
    );
    const availableTags = React.useMemo(
        () =>
            [...new Set(snippets.flatMap(snippet => snippet.tags.map(tag => tag.value)))].sort((a, b) =>
                a.localeCompare(b),
            ),
        [snippets],
    );

    const filteredSnippets = React.useMemo(() => {
        const searchTerm = search.trim().toLocaleLowerCase();
        const filtered = snippets.filter(snippet => {
            if (collection === NO_COLLECTION && snippet.collection?.name) return false;
            if (
                collection.startsWith('collection:') &&
                snippet.collection?.name !== collection.slice('collection:'.length)
            ) {
                return false;
            }

            const snippetTags = snippet.tags.map(tag => tag.value);
            if (
                selectedTags.length &&
                (tagOperator === FilterGroupOperator.AND
                    ? !selectedTags.every(tag => snippetTags.includes(tag))
                    : !selectedTags.some(tag => snippetTags.includes(tag)))
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

            const dateDifference = new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
            return sortOrder === 'newest' ? -dateDifference : dateDifference;
        });
    }, [collection, search, selectedTags, snippets, sortOrder, tagOperator]);

    const pageCount = Math.max(1, Math.ceil(filteredSnippets.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleSnippets = filteredSnippets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const setFilter =
        <T extends string>(setter: React.Dispatch<React.SetStateAction<T>>) =>
        (value: T) => {
            setter(value);
            setPage(1);
        };
    const updateTags = (tags: string[], operator: FilterGroupOperator) => {
        setSelectedTags(tags);
        setTagOperator(operator);
        setPage(1);
    };
    const clearFilters = () => {
        setSearch('');
        setCollection(ALL_COLLECTIONS);
        setSelectedTags([]);
        setTagOperator(FilterGroupOperator.AND);
        setPage(1);
    };

    if (isPending) {
        return <SectionLoader message="Loading offline snippets..." />;
    }

    if (!snippets.length) {
        return (
            <StatusCard
                variant="empty"
                title="No offline snippets yet"
                description="Save a snippet to your offline library and it will be ready whenever you need it."
                layout="section"
                actions={[
                    <Button variant={'default'} asChild>
                        <Link to="/discover">Start Your Journey</Link>
                    </Button>,
                ]}
            />
        );
    }

    return (
        <section className="space-y-7">
            <div className="rounded-2xl border bg-linear-to-br from-primary/10 via-card to-card p-5 sm:p-7">
                <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">Your pocket library</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Find a snippet</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {filteredSnippets.length} of {snippets.length} saved
                    </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1fr)_minmax(11rem,0.65fr)_minmax(11rem,0.65fr)]">
                    <div className="relative">
                        <SearchIcon
                            aria-hidden="true"
                            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            aria-label="Search offline snippets"
                            className="bg-background pl-9"
                            placeholder="Search snippets..."
                            value={search}
                            onChange={event => setFilter(setSearch)(event.target.value)}
                        />
                    </div>
                    <Select value={collection} onValueChange={setFilter(setCollection)}>
                        <SelectTrigger aria-label="Filter by collection" className="w-full bg-background">
                            <FolderIcon className="size-4 text-muted-foreground" />
                            <SelectValue placeholder="All collections" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_COLLECTIONS}>All collections</SelectItem>
                            {snippets.some(snippet => !snippet.collection) && (
                                <SelectItem value={NO_COLLECTION}>Uncollected</SelectItem>
                            )}
                            {collections.map(name => (
                                <SelectItem key={name} value={collectionOption(name)}>
                                    {name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={sortOrder}
                        onValueChange={value => {
                            const selectedOrder = sortOptions.find(option => option.value === value);
                            if (selectedOrder) setFilter(setSortOrder)(selectedOrder.value);
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
                    <div className="mt-5 border-t border-border/70 pt-4">
                        <TagFilterBar
                            tags={availableTags}
                            selectedTags={selectedTags}
                            operator={tagOperator}
                            onChange={updateTags}
                        />
                    </div>
                )}
            </div>

            {filteredSnippets.length === 0 ? (
                <StatusCard
                    variant="empty"
                    title="No matching snippets"
                    description="Try another search or clear your filters to see your saved snippets."
                    layout="section"
                    actions={
                        <Button variant="outline" onClick={clearFilters}>
                            Clear filters
                        </Button>
                    }
                />
            ) : (
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
                                onClick={() => setPage(currentPage - 1)}
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
                                onClick={() => setPage(currentPage + 1)}
                            >
                                Next
                                <ArrowRightIcon />
                            </Button>
                        </nav>
                    </div>
                </>
            )}
        </section>
    );
}

function OfflineSnippetCard({ snippet }: { snippet: OfflineSnippetItem }) {
    const visibleTags = snippet.tags.slice(0, 3);
    const additionalTagCount = snippet.tags.length - visibleTags.length;

    return (
        <Link
            to="/offline/$id"
            params={{ id: snippet.id }}
            className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <Card className="h-full overflow-hidden py-0 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg">
                <div className="h-1.5 bg-linear-to-r from-primary via-primary/60 to-transparent" />
                <CardHeader className="gap-4 px-5 pb-0 pt-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Code2Icon className="size-5" />
                            </div>
                            <div className="min-w-0 space-y-1">
                                <CardTitle className="line-clamp-1 text-base capitalize group-hover:text-primary">
                                    {snippet.name}
                                </CardTitle>
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <CalendarClockIcon className="size-3.5" />
                                    Saved {new Date(snippet.savedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0 capitalize">
                            {snippet.language}
                        </Badge>
                    </div>
                    <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                        {snippet.description || 'A handy snippet, saved for your next coding session.'}
                    </p>
                </CardHeader>
                <CardContent className="px-5">
                    <div className="overflow-hidden rounded-lg border bg-muted/60 p-3">
                        <pre className="line-clamp-3 min-h-15 whitespace-pre-wrap break-all font-mono text-xs leading-5 text-foreground/80">
                            {snippet.code}
                        </pre>
                    </div>
                </CardContent>
                <CardFooter className="flex-wrap gap-2 px-5 pb-5 pt-0">
                    {snippet.collection?.name && (
                        <Badge variant="outline" className="max-w-full truncate">
                            <FolderIcon className="size-3" />
                            {snippet.collection.name}
                        </Badge>
                    )}
                    {visibleTags.map(tag => (
                        <Badge key={tag.value} variant="secondary" className="max-w-28 truncate">
                            #{tag.value}
                        </Badge>
                    ))}
                    {additionalTagCount > 0 && (
                        <span className="text-xs text-muted-foreground">+{additionalTagCount}</span>
                    )}
                </CardFooter>
            </Card>
        </Link>
    );
}

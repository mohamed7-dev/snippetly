import { StatusCard } from '@/components/feedback/status-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDeveloperInfo } from '@/lib/format-developer-info';
import type { SearchDtoType } from '@snippetly/common/dto';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { LoaderCircleIcon } from 'lucide-react';
import { searchQueryOptions } from '../lib/search-query-options';

const resultTypes = ['snippets', 'collections', 'developers'] as const;
type ResultType = (typeof resultTypes)[number];
type SearchOutput = SearchDtoType['output'];

const typeLabels: Record<ResultType, string> = {
    snippets: 'Snippets',
    collections: 'Collections',
    developers: 'Developers',
};

type SearchResultsPageProps = {
    term?: string;
    tags?: string[];
    types?: ResultType[];
};

export function SearchResultsPage({ term, tags = [], types }: SearchResultsPageProps) {
    const navigate = useNavigate();
    const selectedTypes = types ?? [...resultTypes];
    const hasQuery = Boolean(term || tags.length);
    const { data, error, fetchNextPage, hasNextPage, isError, isFetchingNextPage, isPending } =
        useInfiniteQuery(searchQueryOptions({ term, tags }));
    const pages = data?.pages ?? [];
    const firstPage = pages[0];

    const toggleType = (type: ResultType, checked: boolean | 'indeterminate') => {
        const nextTypes = checked
            ? [...new Set([...selectedTypes, type])]
            : selectedTypes.filter(selectedType => selectedType !== type);

        void navigate({
            to: '/search',
            search: previous => ({
                ...previous,
                types: nextTypes.length === resultTypes.length ? undefined : nextTypes,
            }),
        });
    };

    const appendTag = (value: string) => {
        if (tags.some(tag => tag.toLocaleLowerCase() === value.toLocaleLowerCase())) return;

        void navigate({
            to: '/search',
            search: previous => ({ ...previous, tags: [...tags, value] }),
        });
    };

    if (!hasQuery) {
        return (
            <div className="container mx-auto max-w-5xl px-4 py-10">
                <h1 className="mb-4 text-3xl font-heading font-semibold">Search</h1>
                <p className="text-muted-foreground">
                    Search snippets, collections, and developers. Prefix one or more tags with #.
                </p>
            </div>
        );
    }

    if (isPending) {
        return (
            <div className="container mx-auto max-w-5xl px-4 py-10">
                <StatusCard variant="loading" title="Searching" description="Finding matching results..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto max-w-5xl px-4 py-10">
                <StatusCard variant="error" title="Search failed" description={error.message} />
            </div>
        );
    }

    const groups = {
        snippets: {
            items: pages.flatMap(page => page.snippets.items),
            totalItems: firstPage?.snippets.totalItems ?? 0,
        },
        collections: {
            items: pages.flatMap(page => page.collections.items),
            totalItems: firstPage?.collections.totalItems ?? 0,
        },
        developers: {
            items: pages.flatMap(page => page.developers.items),
            totalItems: firstPage?.developers.totalItems ?? 0,
        },
    };
    const visibleItemsCount = selectedTypes.reduce((total, type) => total + groups[type].items.length, 0);

    return (
        <main className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-heading font-semibold">Search results</h1>
                <p className="text-sm text-muted-foreground">
                    {term ? `Results for “${term}”` : 'Results matching your tags'}
                    {tags.length > 0 && ` · ${tags.map(tag => `#${tag}`).join(' ')}`}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
                <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Search filters">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Filter results</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {resultTypes.map(type => (
                                <label
                                    key={type}
                                    className="flex cursor-pointer items-center justify-between gap-3 text-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedTypes.includes(type)}
                                            onCheckedChange={checked => toggleType(type, checked)}
                                        />
                                        {typeLabels[type]}
                                    </span>
                                    <span className="text-muted-foreground">{groups[type].totalItems}</span>
                                </label>
                            ))}
                        </CardContent>
                    </Card>

                    {firstPage?.tagCounts.length ? (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Matching tags</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {firstPage.tagCounts.map(tag => (
                                    <Button
                                        key={tag.value}
                                        disabled={tags.some(
                                            selectedTag =>
                                                selectedTag.toLocaleLowerCase() ===
                                                tag.value.toLocaleLowerCase(),
                                        )}
                                        onClick={() => appendTag(tag.value)}
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                    >
                                        #{tag.value}
                                        <span className="ml-1 text-muted-foreground">{tag.count}</span>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    ) : null}
                </aside>

                <div className="min-w-0 space-y-8">
                    {selectedTypes.length === 0 ? (
                        <StatusCard
                            variant="info"
                            title="Choose a result type"
                            description="Select snippets, collections, or developers in the filters."
                            layout="section"
                        />
                    ) : visibleItemsCount === 0 ? (
                        <StatusCard
                            variant="empty"
                            title="No results found"
                            description="Try different search words or tags."
                            layout="section"
                        />
                    ) : (
                        resultTypes
                            .filter(type => selectedTypes.includes(type))
                            .map(type => (
                                <SearchResultGroup
                                    key={type}
                                    items={groups[type].items}
                                    type={type}
                                    totalItems={groups[type].totalItems}
                                />
                            ))
                    )}

                    {hasNextPage && selectedTypes.length > 0 && (
                        <div className="flex justify-center">
                            <Button disabled={isFetchingNextPage} onClick={() => void fetchNextPage()}>
                                {isFetchingNextPage && (
                                    <LoaderCircleIcon
                                        className="mr-2 size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                {isFetchingNextPage ? 'Loading...' : 'Load more results'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

type SearchResultGroupProps = {
    type: ResultType;
    items:
        | SearchOutput['snippets']['items']
        | SearchOutput['collections']['items']
        | SearchOutput['developers']['items'];
    totalItems: number;
};

function SearchResultGroup({ type, items, totalItems }: SearchResultGroupProps) {
    return (
        <section aria-labelledby={`search-${type}-heading`} className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
                <h2 id={`search-${type}-heading`} className="text-xl font-heading font-semibold">
                    {typeLabels[type]}
                </h2>
                <span className="text-sm text-muted-foreground">{totalItems} results</span>
            </div>
            <div className="grid gap-3">
                {type === 'snippets' &&
                    (items as SearchOutput['snippets']['items']).map(snippet => (
                        <Card key={snippet.id} className="hover:border-primary/40 hover:shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">
                                    <Link
                                        className="hover:text-primary"
                                        params={{ id: snippet.id }}
                                        preload={false}
                                        to="/snippets/$id"
                                    >
                                        {snippet.name}
                                    </Link>
                                </CardTitle>
                                <CardDescription>
                                    {snippet.description || 'No description provided.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{snippet.language}</Badge>
                                <Link
                                    className="text-sm text-muted-foreground hover:text-primary"
                                    params={{ id: snippet.creator.id }}
                                    to="/profile/$id"
                                >
                                    {formatDeveloperInfo(snippet.creator).fullName}
                                </Link>
                                {snippet.collection && (
                                    <Link
                                        className="text-sm text-muted-foreground hover:text-primary"
                                        params={{ id: snippet.collection.id }}
                                        to="/collections/$id"
                                    >
                                        {snippet.collection.name}
                                    </Link>
                                )}
                                {snippet.tags.map(tag => (
                                    <Badge key={tag.value} variant="outline">
                                        #{tag.value}
                                    </Badge>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                {type === 'collections' &&
                    (items as SearchOutput['collections']['items']).map(collection => (
                        <Card key={collection.id} className="hover:border-primary/40 hover:shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <span
                                        aria-hidden="true"
                                        className="size-3 shrink-0 rounded-full"
                                        style={{ backgroundColor: collection.color }}
                                    />
                                    <Link
                                        className="hover:text-primary"
                                        params={{ id: collection.id }}
                                        preload={false}
                                        to="/collections/$id"
                                    >
                                        {collection.name}
                                    </Link>
                                </CardTitle>
                                <CardDescription>
                                    {collection.description || 'No description provided.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-wrap items-center gap-2">
                                <Link
                                    className="text-sm text-muted-foreground hover:text-primary"
                                    params={{ id: collection.creator.id }}
                                    to="/profile/$id"
                                >
                                    {formatDeveloperInfo(collection.creator).fullName}
                                </Link>
                                {collection.tags.map(tag => (
                                    <Badge key={tag.value} variant="outline">
                                        #{tag.value}
                                    </Badge>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                {type === 'developers' &&
                    (items as SearchOutput['developers']['items']).map(developer => {
                        const { fullName, initials } = formatDeveloperInfo(developer);

                        return (
                            <Card key={developer.id} className="hover:border-primary/40 hover:shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-12">
                                            <AvatarImage
                                                src={developer.image || '/placeholder.svg'}
                                                alt={initials}
                                            />
                                            <AvatarFallback>{initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <CardTitle className="text-base">
                                                <Link
                                                    className="hover:text-primary"
                                                    params={{ id: developer.id }}
                                                    to="/profile/$id"
                                                >
                                                    {fullName}
                                                </Link>
                                            </CardTitle>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Joined {new Date(developer.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                {developer.bio && (
                                    <CardContent className="pt-0">
                                        <p className="text-sm text-muted-foreground">{developer.bio}</p>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
            </div>
        </section>
    );
}

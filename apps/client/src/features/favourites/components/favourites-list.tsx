import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { formatDeveloperInfo } from '@/lib/format-developer-info';
import {
    favouriteCollectionsListDto,
    favouriteDevelopersListDto,
    favouriteSnippetsListDto,
} from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import {
    favouriteCollectionsQueryOptions,
    favouriteDevelopersQueryOptions,
    favouriteSnippetsQueryOptions,
} from '../lib/favourites-query-options';
import { FavouriteListLayout } from './shared/favourite-list-layout';
import { RemoveFromFavouritesButton } from './shared/remove-from-favourites-button';

export function FavouriteSnippetsList() {
    const { user } = useAuth();
    const search = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_boundary/favourites/',
    });
    const { filter, filterOperator, sort, tags } = search?.snippets ?? {};
    const queryKey = [filter, filterOperator, sort, tags];
    const navigate = useNavigate();
    const qClient = useQueryClient();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        favouriteSnippetsQueryOptions({ filter, filterOperator, sort, tags }, queryKey),
    );
    const snippets = data.pages.flatMap(page => page.items);
    const availableTags = [...new Set(snippets.flatMap(snippet => snippet.tags).map(tag => tag.value))];

    const onMutateSuccess = () => {
        qClient.invalidateQueries(favouriteSnippetsQueryOptions(undefined, queryKey));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <FilterQueryDialog
                    schema={favouriteSnippetsListDto.input.shape.filter}
                    value={{ filter, filterOperator }}
                    onApply={value =>
                        navigate({
                            to: '.',
                            search: previous => ({
                                ...previous,
                                snippets: { ...previous?.snippets, ...value },
                            }),
                        })
                    }
                />
                <SortQueryDialog
                    sortSchema={favouriteSnippetsListDto.input.shape.sort}
                    value={{ sort }}
                    onApply={value =>
                        navigate({
                            to: '.',
                            search: previous => ({
                                ...previous,
                                snippets: { ...previous?.snippets, sort: value.sort },
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
            <FavouriteListLayout>
                {snippets.map(snippet => {
                    const { fullName } = formatDeveloperInfo(snippet.creator);
                    const isOwner = user?.id === snippet.creator.id;
                    return (
                        <Card key={snippet.id}>
                            <CardContent className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <Link
                                        to="/snippets/$id"
                                        params={{ id: snippet.id }}
                                        className="font-semibold capitalize hover:text-primary"
                                    >
                                        {snippet.name}
                                    </Link>

                                    <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <Badge variant="outline" className="font-mono">
                                            {snippet.language}
                                        </Badge>
                                        <Link
                                            to="/profile/$id"
                                            params={{ id: snippet.creator.id }}
                                            className="hover:text-foreground"
                                        >
                                            {!isOwner ? fullName : <Badge>(You)</Badge>}
                                        </Link>
                                    </div>
                                </div>
                                <RemoveFromFavouritesButton
                                    variant={'destructive-outline'}
                                    resourceType="snippets"
                                    resourceId={snippet.id}
                                    mutationCallbacks={{
                                        onSuccess: onMutateSuccess,
                                    }}
                                />
                            </CardContent>
                        </Card>
                    );
                })}
            </FavouriteListLayout>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                Content={
                    !snippets.length ? (
                        <StatusCard
                            variant="empty"
                            title="No favourite snippets"
                            description="Snippets you favourite will appear here."
                        />
                    ) : null
                }
            />
        </div>
    );
}

export function FavouriteCollectionsList() {
    const { user } = useAuth();
    const search = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_boundary/favourites/',
    });
    const { filter, filterOperator, sort, tags } = search?.collections ?? {};
    const queryKey = [filter, filterOperator, sort, tags];
    const navigate = useNavigate();
    const qClient = useQueryClient();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        favouriteCollectionsQueryOptions({ filter, filterOperator, sort, tags }, queryKey),
    );
    const collections = data.pages.flatMap(page => page.items);
    const availableTags = [
        ...new Set(collections.flatMap(collection => collection.tags).map(tag => tag.value)),
    ];

    const onMutateSuccess = () => {
        qClient.invalidateQueries(favouriteCollectionsQueryOptions(undefined, queryKey));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <FilterQueryDialog
                    schema={favouriteCollectionsListDto.input.shape.filter}
                    value={{ filter, filterOperator }}
                    onApply={value =>
                        navigate({
                            to: '.',
                            search: previous => ({
                                ...previous,
                                collections: { ...previous?.collections, ...value },
                            }),
                        })
                    }
                />
                <SortQueryDialog
                    sortSchema={favouriteCollectionsListDto.input.shape.sort}
                    value={{ sort }}
                    onApply={value =>
                        navigate({
                            to: '.',
                            search: previous => ({
                                ...previous,
                                collections: { ...previous?.collections, sort: value.sort },
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
                                collections: {
                                    ...previous?.collections,
                                    tags: values.length ? { values, operator } : undefined,
                                },
                            }),
                        })
                    }
                />
            </div>
            <FavouriteListLayout>
                {collections.map(collection => {
                    const { fullName } = formatDeveloperInfo(collection.creator);
                    const isOwner = user?.id === collection.creator.id;
                    return (
                        <Card key={collection.id}>
                            <CardContent className="flex items-center justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className="size-4 shrink-0 rounded-full"
                                        style={{ backgroundColor: collection.color }}
                                    />
                                    <div className="min-w-0">
                                        <Link
                                            to="/collections/$id"
                                            params={{ id: collection.id }}
                                            className="font-semibold capitalize hover:text-primary"
                                        >
                                            {collection.name}
                                        </Link>
                                        <p className="mt-4 truncate text-sm text-muted-foreground">
                                            <Link
                                                to="/profile/$id"
                                                params={{ id: collection.creator.id }}
                                                className="hover:text-foreground"
                                            >
                                                {!isOwner ? fullName : <Badge>(You)</Badge>}
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                                <RemoveFromFavouritesButton
                                    variant={'destructive-outline'}
                                    resourceType="collections"
                                    resourceId={collection.id}
                                    mutationCallbacks={{
                                        onSuccess: onMutateSuccess,
                                    }}
                                />
                            </CardContent>
                        </Card>
                    );
                })}
            </FavouriteListLayout>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                Content={
                    !collections.length ? (
                        <StatusCard
                            variant="empty"
                            title="No favourite collections"
                            description="Collections you favourite will appear here."
                        />
                    ) : null
                }
            />
        </div>
    );
}

export function FavouriteDevelopersList() {
    const navigate = useNavigate();
    const qClient = useQueryClient();

    const search = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_boundary/favourites/',
    });
    const { filter, filterOperator, sort } = search?.developers ?? {};
    const queryKey = [filter, filterOperator, sort];
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        favouriteDevelopersQueryOptions({ filter, filterOperator, sort }, queryKey),
    );
    const developers = data.pages.flatMap(page => page.items);

    const onMutateSuccess = () => {
        qClient.invalidateQueries(favouriteDevelopersQueryOptions(undefined, queryKey));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <FilterQueryDialog
                    schema={favouriteDevelopersListDto.input.shape.filter}
                    value={{ filter, filterOperator }}
                    onApply={value =>
                        navigate({
                            to: '.',
                            search: previous => ({
                                ...previous,
                                developers: { ...previous?.developers, ...value },
                            }),
                        })
                    }
                />
                <SortQueryDialog
                    sortSchema={favouriteDevelopersListDto.input.shape.sort}
                    value={{ sort }}
                    onApply={value =>
                        navigate({
                            to: '.',
                            search: previous => ({
                                ...previous,
                                developers: { ...previous?.developers, sort: value.sort },
                            }),
                        })
                    }
                />
            </div>
            <FavouriteListLayout>
                {developers.map(developer => {
                    const { fullName, initials } = formatDeveloperInfo(developer);
                    return (
                        <Card key={developer.id}>
                            <CardContent className="flex items-center justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar>
                                        <AvatarImage
                                            src={developer.image ?? '/placeholder.svg'}
                                            alt={initials}
                                        />
                                        <AvatarFallback>{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <Link
                                            to="/profile/$id"
                                            params={{ id: developer.id }}
                                            className="font-semibold hover:text-primary"
                                        >
                                            {fullName}
                                        </Link>
                                        {developer.bio && (
                                            <p className="mt-4 truncate text-sm text-muted-foreground">
                                                {developer.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <RemoveFromFavouritesButton
                                    variant={'destructive-outline'}
                                    resourceType="developers"
                                    resourceId={developer.id}
                                    mutationCallbacks={{
                                        onSuccess: onMutateSuccess,
                                    }}
                                />
                            </CardContent>
                        </Card>
                    );
                })}
            </FavouriteListLayout>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                Content={
                    !developers.length ? (
                        <StatusCard
                            variant="empty"
                            title="No favourite developers"
                            description="Developers you favourite will appear here."
                        />
                    ) : null
                }
            />
        </div>
    );
}

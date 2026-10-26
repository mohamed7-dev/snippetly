import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { PageActionBar, PageActionBarItem } from '@/components/layout/page-action-bar';
import { queryClient } from '@/components/providers/tanstack-query-provider';
import { CollectionPageMainContent } from '@/features/collections/components/sections/collection-page-main-content';
import { CollectionActionMenu } from '@/features/collections/components/shared/collection-action-menu';
import { getCollectionQueryOptions } from '@/features/collections/lib/query-options';
import { CollectionPageSnippetsList } from '@/features/snippet-listing/components/sections/collection-page-snippets-list';
import { listCollectionSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { snippetListDto } from '@snippetly/common/dto';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Code2Icon } from 'lucide-react';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import z from 'zod';

const searchSchema = z
    .object({
        sort: snippetListDto.input.shape.sort,
        filter: snippetListDto.input.shape.filter,
        filterOperator: snippetListDto.input.shape.filterOperator,
        tags: snippetListDto.input.shape.tags,
    })
    .partial()
    .optional();

export const Route = createFileRoute('/(public)/collections/$id')({
    component: CollectionPage,
    validateSearch: searchSchema,
    head: async ({ params }) => {
        const data = await queryClient.query({
            ...getCollectionQueryOptions(params.id),
        });
        return {
            meta: [
                {
                    name: 'description',
                    content: data.description ?? `Collection of snippets related to ${data.name}`,
                },
                {
                    title: data.name,
                },
            ],
        };
    },
    loaderDeps: ({ search: { sort, filter, filterOperator } = {} }) => ({ sort, filter, filterOperator }),
    loader: async ({ context: { queryClient }, params: { id }, deps }) => {
        await queryClient.query({ ...getCollectionQueryOptions(id), staleTime: 'static' });
        queryClient
            .infiniteQuery({
                ...listCollectionSnippetsQueryOptions(id, deps, Object.values(deps)),
            })
            .catch();
    },
});

function CollectionPage() {
    const { id } = Route.useParams();
    const { data: collection } = useSuspenseQuery(getCollectionQueryOptions(id));

    const navigate = Route.useNavigate();
    const { queryClient: qClient } = Route.useRouteContext();

    const onCollectionMutationSuccess = () => {
        qClient.invalidateQueries(getCollectionQueryOptions(id));
    };
    return (
        <main>
            <Page className="container mx-auto px-4 md:px-6 py-6 max-w-6xl">
                <PageTitle>
                    <div className="flex items-center flex-wrap gap-2">
                        <div
                            style={{ backgroundColor: collection.color }}
                            className={`size-12 rounded-lg flex items-center justify-center`}
                            aria-hidden
                        >
                            <Code2Icon className={'size-8'} />
                        </div>
                        <h1 className="font-heading font-bold text-3xl text-balance capitalize mb-2">
                            {collection.name}
                        </h1>
                    </div>
                </PageTitle>
                <PageDescription>{collection.description}</PageDescription>
                <PageActionBar>
                    <PageActionBarItem>
                        <CollectionActionMenu
                            collection={collection}
                            deleteCollection={{
                                onSuccess: () => {
                                    navigate({ to: '/dashboard/collections' });
                                    onCollectionMutationSuccess();
                                },
                            }}
                            forkCollection={{
                                onSuccess: onCollectionMutationSuccess,
                            }}
                            addCollectionToFavourites={{
                                onSuccess: onCollectionMutationSuccess,
                            }}
                            removeCollectionFromFavourites={{
                                onSuccess: onCollectionMutationSuccess,
                            }}
                            showViewButton={false}
                        />
                    </PageActionBarItem>
                </PageActionBar>
                <div className="space-y-6">
                    <CollectionPageMainContent />
                    <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                        <React.Suspense fallback={<SectionLoader />}>
                            <CollectionPageSnippetsList />
                        </React.Suspense>
                    </ErrorBoundary>
                </div>
            </Page>
        </main>
    );
}

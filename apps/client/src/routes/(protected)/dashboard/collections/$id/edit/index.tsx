import { GoToButton } from '@/components/inputs/goto-button';
import { LoadingButton } from '@/components/inputs/loading-button';
import { Page, PageTitle } from '@/components/layout/page';
import { PageActionBar, PageActionBarItem, PageActionBarMenuItem } from '@/components/layout/page-action-bar';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { MoveCollectionToTrashButton } from '@/features/collection-delete/components/move-collection-to-trash-button';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { CollectionForm } from '@/features/collections/components/forms/collection-form';
import { getCollectionQueryOptions } from '@/features/collections/lib/query-options';
import { listPopularTagsQueryOptions } from '@/features/tags/lib/list-tags-query-options';
import { useUpdateCollection } from '@/features/update-collection/hooks/use-update-collection';
import {
    updateCollectionFormSchema,
    type UpdateCollectionFormSchemaType,
} from '@/features/update-collection/lib/schema';
import { notFoundWithMetadata } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Permission } from '@snippetly/common/dto';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { SaveIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/(protected)/dashboard/collections/$id/edit/')({
    component: UpdateCollectionPage,
    head: async ({ params, match }) => {
        const { queryClient } = match.context;
        const data = await queryClient.query({
            ...getCollectionQueryOptions(params.id),
            staleTime: 'static',
        });
        return {
            meta: [
                {
                    name: 'description',
                    content: data.description ?? `Update Collection ${data.name} Info`,
                },
                {
                    title: `Update Collection ${data.name}`,
                },
            ],
        };
    },
    loader: async ({ context: { queryClient }, params }) => {
        void queryClient.query(listPopularTagsQueryOptions()).catch();
        return await queryClient.query({ ...getCollectionQueryOptions(params.id), staleTime: 'static' });
    },
});

function UpdateCollectionPage() {
    const { id } = Route.useParams();
    const navigate = Route.useNavigate();

    const { data } = useQuery(getCollectionQueryOptions(id));
    const qClient = useQueryClient();
    if (!data) {
        throw notFoundWithMetadata({
            data: {
                title: 'Collection not found',
                description: "The collection you are looking for doesn't exist or has been moved.",
            },
        });
    }
    const updateCollectionForm = useForm<UpdateCollectionFormSchemaType>({
        defaultValues: { ...data, tags: data.tags.map(t => t.value) },
        resolver: zodResolver(updateCollectionFormSchema),
    });

    const { mutateAsync, isPending } = useUpdateCollection({
        onSuccess: async data => {
            updateCollectionForm.reset({ ...data, tags: data.tags?.map(t => t.value) });
            await qClient.invalidateQueries(getCollectionQueryOptions(id));
            qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions());
        },
    });
    return (
        <Page
            form={updateCollectionForm}
            submitHandler={updateCollectionForm.handleSubmit(values => mutateAsync(values))}
            pageHeaderClassName="px-4 md:px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50"
        >
            <PageTitle>Edit Collection</PageTitle>
            <PageActionBar>
                <PageActionBarItem hideOnSmallScreens>
                    <GoToButton label={`Go to collection`} to="/collections/$id" params={{ id: id } as any} />
                </PageActionBarItem>

                <PageActionBarItem hideOnSmallScreens>
                    <PermissionGuard
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.DeleteCollection,
                            Permission.Owner,
                        ]}
                        ownerId={data.creator.id}
                    >
                        <MoveCollectionToTrashButton
                            collectionId={data.id}
                            mutationCallbacks={{
                                onSuccess: () => {
                                    qClient.invalidateQueries(getCollectionQueryOptions(id));
                                    navigate({ to: '/dashboard/collections' });
                                },
                            }}
                            type="button"
                            variant={'destructive-outline'}
                            className="w-auto"
                        />
                    </PermissionGuard>
                </PageActionBarItem>
                <PageActionBarItem>
                    <PermissionGuard
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.UpdateCollection,
                            Permission.Owner,
                        ]}
                        ownerId={data.creator.id}
                        isAvailableOffline
                    >
                        <LoadingButton isLoading={isPending} type="submit">
                            <SaveIcon />
                            <span className="sr-only sm:not-sr-only">Save Changes</span>
                        </LoadingButton>
                    </PermissionGuard>
                </PageActionBarItem>

                <PageActionBarMenuItem>
                    <DropdownMenuItem asChild>
                        <GoToButton
                            label={`Go to collection`}
                            to="/collections/$id"
                            params={{ id: id } as any}
                            variant={'ghost'}
                            className="w-full justify-start"
                        />
                    </DropdownMenuItem>
                </PageActionBarMenuItem>
                <PageActionBarMenuItem>
                    <PermissionGuard
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.DeleteCollection,
                            Permission.Owner,
                        ]}
                        ownerId={data.creator.id}
                    >
                        <DropdownMenuItem asChild>
                            <MoveCollectionToTrashButton
                                collectionId={data.id}
                                mutationCallbacks={{
                                    onSuccess: () => {
                                        qClient.invalidateQueries(getCollectionQueryOptions(id));
                                        navigate({ to: '/dashboard/collections' });
                                    },
                                }}
                                type="button"
                                variant={'ghost'}
                                className="w-full justify-start"
                            />
                        </DropdownMenuItem>
                    </PermissionGuard>
                </PageActionBarMenuItem>
            </PageActionBar>
            <PermissionGuard
                requiredPermissions={[
                    Permission.Authenticated,
                    Permission.UpdateCollection,
                    Permission.Owner,
                ]}
                ownerId={data.creator.id}
                isAvailableOffline={true}
            >
                <main className="container mx-auto px-2 lg:px-6 py-8 max-w-2xl">
                    <CollectionForm isPending={isPending} />
                </main>
            </PermissionGuard>
        </Page>
    );
}

import { GoToButton } from '@/components/inputs/goto-button';
import { LoadingButton } from '@/components/inputs/loading-button';
import { Page, PageTitle } from '@/components/layout/page';
import { PageActionBar, PageActionBarItem, PageActionBarMenuItem } from '@/components/layout/page-action-bar';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { CollectionForm } from '@/features/collections/components/forms/collection-form';
import { useCreateCollection } from '@/features/create-collection/hooks/use-create-collection';
import {
    createCollectionFormSchema,
    type CreateCollectionFormSchemaType,
} from '@/features/create-collection/lib/schema';
import { listPopularTagsQueryOptions } from '@/features/tags/lib/list-tags-query-options';
import { redirectSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Permission } from '@snippetly/common/dto';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { SaveIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/(protected)/dashboard/collections/new/')({
    component: RouteComponent,
    validateSearch: redirectSchema,
    head: () => {
        return {
            meta: [
                {
                    title: 'Create New Collection',
                },
            ],
        };
    },
    loader: ({ context: { queryClient } }) => {
        queryClient.query({ ...listPopularTagsQueryOptions() }).catch();
    },
});

function RouteComponent() {
    const { redirect } = Route.useSearch();

    const navigate = Route.useNavigate();
    const qClient = useQueryClient();
    const createCollectionForm = useForm<CreateCollectionFormSchemaType>({
        defaultValues: {
            name: '',
            description: '',
            color: '',
            isPrivate: false,
            allowForking: true,
            tags: [],
        },
        resolver: zodResolver(createCollectionFormSchema),
    });
    const { mutateAsync, isPending } = useCreateCollection({
        onSuccess: async data => {
            createCollectionForm.reset();
            if (data.status === 'synced') {
                if (redirect) {
                    if (redirect === '/dashboard/snippets/new') {
                        await navigate({
                            to: redirect,
                            search: {
                                collectionId: data.data.id,
                                collectionName: data.data.name,
                            },
                        });
                    } else {
                        await navigate({
                            to: redirect,
                            search: prev => ({
                                ...prev,
                                collectionId: data.data.id,
                                collectionName: data.data.name,
                            }),
                        });
                    }
                } else {
                    await navigate({ to: '/collections/$id', params: { id: data.data.id } });
                }
                void qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions());
            }
        },
    });
    return (
        <Page
            pageHeaderClassName="px-4 md:px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50"
            form={createCollectionForm}
            submitHandler={createCollectionForm.handleSubmit(values => mutateAsync(values))}
        >
            <PageTitle>Create New Collection</PageTitle>
            <PageActionBar>
                <PageActionBarItem hideOnSmallScreens>
                    <GoToButton
                        to={redirect ?? '/dashboard/collections'}
                        label={!redirect ? 'Go to Collections' : 'Go Back'}
                    />
                </PageActionBarItem>
                <PageActionBarItem>
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateCollection]}
                        isAvailableOffline={true}
                    >
                        <LoadingButton isLoading={isPending} type="submit">
                            <SaveIcon />
                            <span className="sr-only sm:not-sr-only">Create Collection</span>
                        </LoadingButton>
                    </PermissionGuard>
                </PageActionBarItem>
                <PageActionBarMenuItem>
                    <DropdownMenuItem asChild>
                        <GoToButton
                            to={redirect ?? '/dashboard/collections'}
                            label={!redirect ? 'Go to Collections' : 'Go Back'}
                            variant={'ghost'}
                            className="justify-start w-full"
                        />
                    </DropdownMenuItem>
                </PageActionBarMenuItem>
            </PageActionBar>

            <PermissionGuard
                requiredPermissions={[Permission.Authenticated, Permission.CreateCollection]}
                isAvailableOffline={true}
            >
                <main className="container mx-auto px-2 lg:px-6 py-6 max-w-2xl">
                    <CollectionForm isPending={isPending} />
                </main>
            </PermissionGuard>
        </Page>
    );
}

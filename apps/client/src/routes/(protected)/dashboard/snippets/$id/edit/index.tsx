import { GoToButton } from '@/components/inputs/goto-button';
import { LoadingButton } from '@/components/inputs/loading-button';
import { Page, PageTitle } from '@/components/layout/page';
import { PageActionBar, PageActionBarItem, PageActionBarMenuItem } from '@/components/layout/page-action-bar';
import { UpdateSnippetIcon } from '@/components/shared/creation-icons';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { getOfflineOwnerId, isOfflineMutationAvailable } from '@/features/offline-snippet/lib/common';
import { MoveSnippetToTrashButton } from '@/features/snippet-delete/components/move-snippet-to-trash-button';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { SnippetFormMainFields } from '@/features/snippets/components/forms/snippet-form-main-fields';
import { SnippetFormSidebar } from '@/features/snippets/components/forms/snippet-form-sidebar';
import { getSnippetQueryOptions } from '@/features/snippets/lib/snippet-query-options';
import { listPopularTagsQueryOptions } from '@/features/tags/lib/list-tags-query-options';
import { useUpdateSnippet } from '@/features/update-snippet/hooks/use-update-snippet';
import {
    updateSnippetFormSchema,
    type UpdateSnippetFormSchemaType,
} from '@/features/update-snippet/lib/schema';
import { notFoundWithMetadata } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Permission } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/(protected)/dashboard/snippets/$id/edit/')({
    component: EditSnippetPage,
    head: async ({ params, match }) => {
        const { queryClient } = match.context;
        const data = await queryClient.query({
            ...getSnippetQueryOptions(params.id),
        });
        return {
            meta: [
                {
                    name: 'description',
                    content: data.description ?? `Update Snippet ${data.name} Info`,
                },
                {
                    title: `Update Snippet ${data.name}`,
                },
            ],
        };
    },
    beforeLoad: async ({ params: { id }, context: { queryClient, auth } }) => {
        const data = await queryClient.query({ ...getSnippetQueryOptions(id) });
        const ownerId = auth.user?.id ?? (isOfflineMutationAvailable() ? getOfflineOwnerId() : undefined);
        if (ownerId !== data.creator.id) {
            throw redirect({
                to: '/developers/$id',
                params: { id: data.creator.id },
            });
        }
    },
    loader: async ({ context: { queryClient }, params }) => {
        queryClient.query(listPopularTagsQueryOptions()).catch();
        return await queryClient.query({ ...getSnippetQueryOptions(params.id), staleTime: 'static' });
    },
});

function EditSnippetPage() {
    const { id } = Route.useParams();
    const navigate = Route.useNavigate();
    const { data } = useSuspenseQuery(getSnippetQueryOptions(id));
    const collection = 'collection' in data ? data.collection : undefined;
    const qClient = useQueryClient();
    if (!data) {
        throw notFoundWithMetadata({
            data: {
                title: 'Snippet not found',
                description: "The snippet you are looking for doesn't exist or has been moved.",
            },
        });
    }
    const form = useForm<UpdateSnippetFormSchemaType>({
        defaultValues: { ...data, tags: data.tags.map(t => t.value), collectionId: collection?.id },
        resolver: zodResolver(updateSnippetFormSchema),
    });

    const { mutateAsync, isPending } = useUpdateSnippet({
        onSuccess: async data => {
            form.reset({ ...data, tags: data.tags?.map(t => t.value), collectionId: data.collection?.id });
            await qClient.invalidateQueries(getSnippetQueryOptions(id));
            qClient.invalidateQueries(listCurrentUserSnippetsQueryOptions());
        },
    });
    return (
        <Page
            form={form}
            submitHandler={form.handleSubmit(values => mutateAsync(values))}
            pageHeaderClassName="px-4 md:px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50"
        >
            <PageTitle>Edit Snippet</PageTitle>
            <PageActionBar>
                <PageActionBarItem hideOnSmallScreens>
                    <GoToButton label="Go to Snippet" to="/snippets/$id" params={{ id: id } as any} />
                </PageActionBarItem>

                <PageActionBarItem hideOnSmallScreens>
                    <PermissionGuard
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.DeleteSnippet,
                            Permission.Owner,
                        ]}
                        ownerId={data.creator.id}
                    >
                        <MoveSnippetToTrashButton
                            snippetId={data.id}
                            mutationCallbacks={{
                                onSuccess: () => {
                                    qClient.invalidateQueries(getSnippetQueryOptions(id));
                                    navigate({ to: '/dashboard/snippets' });
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
                            Permission.UpdateSnippet,
                            Permission.Owner,
                        ]}
                        ownerId={data.creator.id}
                        isAvailableOffline
                    >
                        <LoadingButton isLoading={isPending} type="submit">
                            <UpdateSnippetIcon className="size-4 sm:mr-2" />
                            Save Changes
                        </LoadingButton>
                    </PermissionGuard>
                </PageActionBarItem>

                <PageActionBarMenuItem>
                    <DropdownMenuItem asChild>
                        <GoToButton
                            label="Go to Snippet"
                            to="/snippets/$id"
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
                            Permission.DeleteSnippet,
                            Permission.Owner,
                        ]}
                        ownerId={data.creator.id}
                    >
                        <DropdownMenuItem asChild>
                            <MoveSnippetToTrashButton
                                snippetId={data.id}
                                mutationCallbacks={{
                                    onSuccess: () => {
                                        qClient.invalidateQueries(getSnippetQueryOptions(id));
                                        navigate({ to: '/dashboard/snippets' });
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
                requiredPermissions={[Permission.Authenticated, Permission.Owner, Permission.UpdateSnippet]}
                ownerId={data.creator.id}
                isAvailableOffline={true}
            >
                <main className="container mx-auto px-3 lg:px-6 py-8 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 min-w-0 space-y-6">
                            <SnippetFormMainFields isPending={isPending} snippetId={data.id} />
                        </div>
                        <SnippetFormSidebar isPending={isPending} selectedCollectionName={collection?.name} />
                    </div>
                </main>
            </PermissionGuard>
        </Page>
    );
}

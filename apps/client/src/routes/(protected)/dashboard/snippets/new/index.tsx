import { GoToButton } from '@/components/inputs/goto-button';
import { LoadingButton } from '@/components/inputs/loading-button';
import { Page, PageTitle } from '@/components/layout/page';
import { PageActionBar, PageActionBarItem, PageActionBarMenuItem } from '@/components/layout/page-action-bar';
import { CreateSnippetIcon } from '@/components/shared/creation-icons';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { useCreateSnippet } from '@/features/create-snippet/hooks/use-create-snippet';
import {
    createSnippetFormSchema,
    type CreateSnippetFormSchemaType,
} from '@/features/create-snippet/lib/schema';
import {
    clearSnippetDraft,
    loadSnippetDraft,
    saveSnippetDraft,
} from '@/features/create-snippet/lib/snippet-draft-storage';
import { isOfflineMutationAvailable } from '@/features/offline-snippet/lib/common';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { SnippetFormMainFields } from '@/features/snippets/components/forms/snippet-form-main-fields';
import { SnippetFormSidebar } from '@/features/snippets/components/forms/snippet-form-sidebar';
import { listPopularTagsQueryOptions } from '@/features/tags/lib/list-tags-query-options';
import { redirectSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { idSchema, Permission } from '@snippetly/common/dto';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const searchSchema = redirectSchema
    .extend({
        collectionId: idSchema.optional(),
        collectionName: z.string().optional(),
    })
    .partial();

export const Route = createFileRoute('/(protected)/dashboard/snippets/new/')({
    component: CreateSnippetPage,
    validateSearch: searchSchema,
    head: () => {
        return {
            meta: [
                {
                    title: 'Create New Snippet',
                },
            ],
        };
    },
    loader: async ({ context: { queryClient } }) => {
        queryClient.query(listPopularTagsQueryOptions()).catch();
        if (!isOfflineMutationAvailable()) {
            await queryClient.infiniteQuery({
                ...listCurrentUserCollectionsQueryOptions(),
                staleTime: 'static',
            });
        }
    },
});

function CreateSnippetPage() {
    const qClient = useQueryClient();
    const navigate = Route.useNavigate();
    const { collectionId, collectionName, redirect } = Route.useSearch();
    const [snippetDraft] = React.useState(loadSnippetDraft);
    const form = useForm<CreateSnippetFormSchemaType>({
        defaultValues: {
            name: '',
            slug: '',
            description: '',
            note: '',
            code: '',
            language: '',
            isPrivate: false,
            allowForking: true,
            tags: [],
            ...snippetDraft,
            collectionId: collectionId ?? snippetDraft?.collectionId,
        },
        resolver: zodResolver(createSnippetFormSchema),
    });

    React.useEffect(() => {
        const subscription = form.watch(values => saveSnippetDraft(values));
        return () => subscription.unsubscribe();
    }, [form]);

    const { mutateAsync, isPending } = useCreateSnippet({
        onSuccess: async data => {
            form.reset();
            clearSnippetDraft();
            if (data.status === 'synced') {
                await navigate({ to: '/snippets/$id', params: { id: data.data.id } });
                void qClient.invalidateQueries(listCurrentUserSnippetsQueryOptions());
            }
        },
    });
    return (
        <Page
            pageHeaderClassName="px-4 md:px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50"
            form={form}
            submitHandler={form.handleSubmit(values => mutateAsync(values))}
        >
            <PageTitle>Create New Snippet</PageTitle>
            <PageActionBar>
                <PageActionBarItem hideOnSmallScreens>
                    <GoToButton
                        to={redirect ?? '/dashboard/snippets'}
                        label={!redirect ? 'Go to Snippets' : 'Go Back'}
                    />
                </PageActionBarItem>
                <PageActionBarItem hideOnSmallScreens>
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                        isAvailableOffline={true}
                    >
                        <LoadingButton isLoading={isPending} type="submit">
                            <CreateSnippetIcon className="size-4" />
                            Create Snippet
                        </LoadingButton>
                    </PermissionGuard>
                </PageActionBarItem>
                <PageActionBarMenuItem>
                    <DropdownMenuItem asChild>
                        <GoToButton
                            to={redirect ?? '/dashboard/snippets'}
                            label={!redirect ? 'Back to Snippets' : 'Go Back'}
                            variant={'ghost'}
                            className="justify-start w-full"
                        />
                    </DropdownMenuItem>
                </PageActionBarMenuItem>
                <PageActionBarMenuItem>
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                        isAvailableOffline={true}
                    >
                        <DropdownMenuItem asChild>
                            <LoadingButton
                                variant={'ghost'}
                                className="justify-start w-full"
                                isLoading={isPending}
                                type="submit"
                            >
                                <CreateSnippetIcon className="size-4" />
                                Create Snippet
                            </LoadingButton>
                        </DropdownMenuItem>
                    </PermissionGuard>
                </PageActionBarMenuItem>
            </PageActionBar>

            <PermissionGuard
                requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                isAvailableOffline={true}
            >
                <main className="container mx-auto px-3 lg:px-6 py-6 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <SnippetFormMainFields isPending={isPending} />
                        </div>
                        <SnippetFormSidebar isPending={isPending} selectedCollectionName={collectionName} />
                    </div>
                </main>
            </PermissionGuard>
        </Page>
    );
}

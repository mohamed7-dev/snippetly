import { Page } from '@/components/layout/page';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { CreateSnippetPageHeader } from '@/features/create-snippet/components/sections/create-snippet-page-header';
import { useCreateSnippet } from '@/features/create-snippet/hooks/use-create-snippet';
import {
    createSnippetFormSchema,
    type CreateSnippetFormSchemaType,
} from '@/features/create-snippet/lib/schema';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { SnippetFormMainFields } from '@/features/snippets/components/forms/snippet-form-main-fields';
import { SnippetFormSidebar } from '@/features/snippets/components/forms/snippet-form-sidebar';
import { listPopularTagsQueryOptions } from '@/features/tags/lib/list-tags-query-options';
import { zodResolver } from '@hookform/resolvers/zod';
import { Permission } from '@snippetly/common/dto';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/(protected)/dashboard/snippets/new/')({
    component: CreateSnippetPage,
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
        await queryClient.infiniteQuery({ ...listCurrentUserCollectionsQueryOptions(), staleTime: 'static' });
    },
});

function CreateSnippetPage() {
    const qClient = useQueryClient();
    const navigate = Route.useNavigate();
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
        },
        resolver: zodResolver(createSnippetFormSchema),
    });
    const { mutateAsync, isPending } = useCreateSnippet({
        onSuccess: async data => {
            form.reset();
            await navigate({ to: '../$id', params: { id: data.id } });
            qClient.invalidateQueries(listCurrentUserSnippetsQueryOptions());
        },
    });
    return (
        <Page form={form} submitHandler={form.handleSubmit(values => mutateAsync(values))}>
            <CreateSnippetPageHeader isPending={isPending} />

            <PermissionGuard requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}>
                <main className="container mx-auto px-2 lg:px-6 py-8 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <SnippetFormMainFields isPending={isPending} />
                        </div>
                        <SnippetFormSidebar isPending={isPending} />
                    </div>
                </main>
            </PermissionGuard>
        </Page>
    );
}

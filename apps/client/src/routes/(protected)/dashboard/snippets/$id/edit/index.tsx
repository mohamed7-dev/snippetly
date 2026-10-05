import { Page } from '@/components/layout/page';
import { SnippetFormMainFields } from '@/features/snippets/components/forms/snippet-form-main-fields';
import { SnippetFormSidebar } from '@/features/snippets/components/forms/snippet-form-sidebar';
import { getSnippetQueryOptions } from '@/features/snippets/lib/snippet-query-options';
import { listPopularTagsQueryOptions } from '@/features/tags/lib/list-tags-query-options';
import { UpdateSnippetPageHeader } from '@/features/update-snippet/components/update-snippet-page-header';
import { useUpdateSnippet } from '@/features/update-snippet/hooks/use-update-snippet';
import {
    updateSnippetFormSchema,
    type UpdateSnippetFormSchemaType,
} from '@/features/update-snippet/lib/schema';
import { notFoundWithMetadata } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
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
        const { user } = auth;
        if (user?.id !== data.creator.id) {
            throw redirect({
                to: '/profile/$id',
                params: { id: data.creator.id },
            });
        }
    },
    loader: async ({ context: { queryClient } }) => {
        queryClient.query(listPopularTagsQueryOptions()).catch();
    },
});

function EditSnippetPage() {
    const { id } = Route.useParams();
    const { data } = useSuspenseQuery(getSnippetQueryOptions(id));
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
        defaultValues: { ...data, tags: data.tags.map(t => t.value), collectionId: data.collection?.id },
        resolver: zodResolver(updateSnippetFormSchema),
    });

    const { mutateAsync, isPending } = useUpdateSnippet({
        onSuccess: async data => {
            form.reset({ ...data, tags: data.tags?.map(t => t.value), collectionId: data.collection?.id });
            await qClient.invalidateQueries(getSnippetQueryOptions(id));
            // TODO: revalidates the snippets list
        },
    });
    return (
        <Page form={form} submitHandler={form.handleSubmit(values => mutateAsync(values))}>
            <UpdateSnippetPageHeader isPending={isPending} />
            <main className="container mx-auto px-2 lg:px-6 py-8 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <SnippetFormMainFields isPending={isPending} snippetId={data.id} />
                    </div>
                    <SnippetFormSidebar
                        isPending={isPending}
                        selectedCollectionName={data.collection?.name}
                    />
                </div>
            </main>
        </Page>
    );
}

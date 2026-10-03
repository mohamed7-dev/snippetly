import { Page } from '@/components/layout/page';
import { CollectionForm } from '@/features/collections/components/forms/collection-form';
import { CreateCollectionPageHeader } from '@/features/create-collection/components/sections/create-collection-page-header';
import { useCreateCollection } from '@/features/create-collection/hooks/use-create-collection';
import {
    createCollectionFormSchema,
    type CreateCollectionFormSchemaType,
} from '@/features/create-collection/lib/schema';
import { listPopularTagsQueryOptions } from '@/features/tags/lib/list-tags-query-options';
import { redirectSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/(protected)/dashboard/collections/new')({
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
    loader: async ({ context: { queryClient } }) => {
        await queryClient.query({ ...listPopularTagsQueryOptions(), staleTime: 'static' });
    },
});

function RouteComponent() {
    const navigate = Route.useNavigate();
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
            // TODO: revalidates the collections list
            await navigate({ to: '../$id', params: { id: data.id } });
        },
    });
    return (
        <Page
            form={createCollectionForm}
            submitHandler={createCollectionForm.handleSubmit(values => mutateAsync(values))}
        >
            <CreateCollectionPageHeader isPending={isPending} />
            <main className="container mx-auto px-2 lg:px-6 py-8 max-w-2xl">
                <CollectionForm isPending={isPending} />
            </main>
        </Page>
    );
}

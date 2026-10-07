import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { DeleteCollectionButton } from '@/features/collection-delete/components/delete-collection-button';
import { getCollectionQueryOptions } from '@/features/collections/lib/query-options';
import { Permission } from '@snippetly/common/dto';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { ArrowLeftIcon, EyeIcon, SaveIcon } from 'lucide-react';
import { useFormContext, type UseFormReturn } from 'react-hook-form';
import type { UpdateCollectionFormSchemaType } from '../../lib/schema';

export function UpdateCollectionPageHeader({ isPending }: { isPending: boolean }) {
    const { id } = useParams({
        from: '/(protected)/dashboard/collections/$id/edit/',
    });
    const { data } = useQuery(getCollectionQueryOptions(id));

    const updateCollectionForm: UseFormReturn<UpdateCollectionFormSchemaType> = useFormContext();
    const isValid = updateCollectionForm.formState.isValid;
    const isSubmitting = updateCollectionForm.formState.isSubmitting;

    return (
        <HeaderWrapper className="justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" type="button" asChild>
                    <Link
                        to={'/dashboard/collections/$id'}
                        params={{ id }}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back To Collection
                    </Link>
                </Button>
                <h1 className="font-heading font-semibold text-sm sm:text-lg">Update Collection</h1>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap w-full sm:w-auto">
                <PermissionGuard
                    requiredPermissions={[
                        Permission.Authenticated,
                        Permission.DeleteCollection,
                        Permission.Owner,
                    ]}
                    ownerId={data?.creator.id}
                >
                    <Button type="button" variant={'outline'} disabled={isSubmitting || !isValid} asChild>
                        <Link to={'/dashboard/collections/$id'} params={{ id }}>
                            <EyeIcon className="h-4 w-4 mr-2" />
                            Preview
                        </Link>
                    </Button>
                </PermissionGuard>
                <PermissionGuard
                    requiredPermissions={[
                        Permission.Authenticated,
                        Permission.DeleteCollection,
                        Permission.Owner,
                    ]}
                    ownerId={data?.creator.id}
                >
                    <DeleteCollectionButton type="button" collectionId={id} variant={'destructive'} />
                </PermissionGuard>

                <PermissionGuard
                    requiredPermissions={[
                        Permission.Authenticated,
                        Permission.DeleteCollection,
                        Permission.Owner,
                    ]}
                    ownerId={data?.creator.id}
                >
                    <LoadingButton disabled={isPending || !isValid} isLoading={isPending} type="submit">
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Save Changes
                    </LoadingButton>
                </PermissionGuard>
            </div>
        </HeaderWrapper>
    );
}

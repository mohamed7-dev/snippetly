import { GoToButton } from '@/components/inputs/goto-button';
import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { MoveCollectionToTrashButton } from '@/features/collection-delete/components/move-collection-to-trash-button';
import { getCollectionQueryOptions } from '@/features/collections/lib/query-options';
import { Permission } from '@snippetly/common/dto';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { EyeIcon, SaveIcon } from 'lucide-react';
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
                <GoToButton label="Back To Collections" to="/dashboard/collections" />
                <h1 className="font-heading font-semibold text-sm sm:text-lg">Update Collection</h1>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap w-full sm:w-auto">
                <PermissionGuard
                    requiredPermissions={[
                        Permission.Authenticated,
                        Permission.UpdateCollection,
                        Permission.Owner,
                    ]}
                    ownerId={data?.creator.id}
                    isAvailableOffline
                >
                    <Button type="button" variant={'outline'} disabled={isSubmitting || !isValid} asChild>
                        <Link to={'/collections/$id'} params={{ id }}>
                            <EyeIcon />
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
                    <MoveCollectionToTrashButton
                        type="button"
                        collectionId={id}
                        variant={'destructive-outline'}
                    />
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

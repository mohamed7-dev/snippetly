import { ProcessStatus } from '@/components/feedback/process-status';
import { LoadingButton } from '@/components/inputs/loading-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation';
import { useNavigate } from '@tanstack/react-router';
import { Trash2Icon } from 'lucide-react';
import { useDeleteDeveloperAccount } from '../../hooks/use-delete-developer-account';

export function SecuritySettingsPageAccountDeletion() {
    const { confirm, resetAndClose } = useDeleteConfirmation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const { mutateAsync: deleteAccount, isPending } = useDeleteDeveloperAccount({
        onSuccess: () => {
            resetAndClose?.();
            logout('developer');
            navigate({ to: '/goodbye', search: { 'redirected-from-delete': true } });
        },
    });

    const handleDelete = () => {
        confirm({
            title: 'Account Deletion',
            description:
                'Your account will be deactivated for 30 days. during this period you will lose access to your snippets, collections, and profile data unless you sign back in in this case your account will be reactivated. after this period your will lose access to your data permanently',
            onConfirm: async () => await deleteAccount(),
            isPending: isPending,
        });
    };

    return (
        <Card className="border-destructive/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2Icon className="h-5 w-5" />
                    Delete Account
                </CardTitle>
                <CardDescription>
                    Permanently delete your account and all associated data. This action cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <ProcessStatus
                    variant={'destructive'}
                    showCloseButton={false}
                    title="Account Deletion"
                    description={
                        <p>
                            <strong>Warning:</strong> Deleting your account will schedule removal of all your
                            snippets, collections, and profile data after <b>30 days</b>. during this period
                            you can sign-in and your account will be reactivated again
                        </p>
                    }
                />
                <LoadingButton
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={handleDelete}
                    isLoading={isPending}
                >
                    Delete My Account
                </LoadingButton>
            </CardContent>
        </Card>
    );
}

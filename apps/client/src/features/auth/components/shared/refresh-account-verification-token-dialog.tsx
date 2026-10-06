import { ProcessStatus } from '@/components/feedback/process-status';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { useRefreshVerificationToken } from '../../hooks/use-refresh-verification-token';
import type { RefreshAccountVerificationTokenFormSchemaType } from '../../lib/schema';
import { RefreshAccountVerificationTokenForm } from '../forms/refresh-account-verification-token-form';

export function RefreshAccountVerificationTokenDialog({
    isOpen,
    onOpenChange,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { mutateAsync, isPending, data } = useRefreshVerificationToken();
    const onSubmit = async (values: RefreshAccountVerificationTokenFormSchemaType) => {
        await mutateAsync(values);
    };
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader className="flex-row items-center justify-between space-y-0">
                    <AlertDialogTitle>Refresh Account Verification Token</AlertDialogTitle>
                    <AlertDialogCancel asChild>
                        <Button variant="ghost" size="icon" aria-label="Close refresh verification form">
                            <XIcon />
                        </Button>
                    </AlertDialogCancel>
                </AlertDialogHeader>
                {!!data && (
                    <ProcessStatus
                        variant={'info'}
                        title={'Verification token was refreshed successfully'}
                        description={'Check you email address, and click the link to verify your account'}
                    />
                )}
                <RefreshAccountVerificationTokenForm isPending={isPending} onSubmit={onSubmit} />
            </AlertDialogContent>
        </AlertDialog>
    );
}

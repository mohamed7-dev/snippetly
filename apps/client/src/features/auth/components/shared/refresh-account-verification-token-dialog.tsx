import { ProcessStatus } from '@/components/feedback/process-status';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRefreshVerificationToken } from '../../hooks/use-refresh-verification-token';
import {
    refreshAccountVerificationTokenFormSchema,
    type RefreshAccountVerificationTokenFormSchemaType,
} from '../../lib/schema';
import { RefreshAccountVerificationTokenForm } from '../forms/refresh-account-verification-token-form';

export function RefreshAccountVerificationTokenDialog({
    isOpen,
    onOpenChange,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<RefreshAccountVerificationTokenFormSchemaType>({
        defaultValues: {
            emailAddress: '',
        },
        resolver: zodResolver(refreshAccountVerificationTokenFormSchema),
    });
    const { mutateAsync, isPending, data } = useRefreshVerificationToken();

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
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(async values => await mutateAsync(values))}
                        className="space-y-8"
                    >
                        {!!data && !isPending && (
                            <ProcessStatus
                                variant={'info'}
                                title={'Verification token was refreshed successfully'}
                                description={
                                    'Check you email address, and click the link to verify your account'
                                }
                            />
                        )}
                        <RefreshAccountVerificationTokenForm isPending={isPending} />
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

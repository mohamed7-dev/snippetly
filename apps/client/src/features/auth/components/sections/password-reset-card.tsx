import { ProcessStatus } from '@/components/feedback/process-status';
import { LoadingButton } from '@/components/inputs/loading-button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { PasswordResetForm } from '../forms/password-reset-form';
import { AuthCard } from '../shared/auth-card';

export function PasswordResetCard({
    isPending,
    successMessage,
    errorMessage,
}: {
    isPending: boolean;
    successMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
}) {
    return (
        <AuthCard cardTitle="Reset Your Password?" cardDescription="Enter the new password.">
            <CardContent className="space-y-6">
                {!!successMessage && (
                    <ProcessStatus title="Success" description={successMessage} showCloseButton={false} />
                )}
                {!!errorMessage && (
                    <ProcessStatus
                        variant={'destructive'}
                        title={'Error'}
                        description={errorMessage}
                        showCloseButton={false}
                    />
                )}
                <PasswordResetForm isPending={isPending} />
            </CardContent>
            <CardFooter>
                <LoadingButton isLoading={isPending} type="submit" className="w-full">
                    Reset Password
                </LoadingButton>
            </CardFooter>
        </AuthCard>
    );
}

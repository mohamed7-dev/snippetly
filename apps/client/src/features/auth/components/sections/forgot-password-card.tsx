import { ProcessStatus } from '@/components/feedback/process-status';
import { LoadingButton } from '@/components/inputs/loading-button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { ForgotPasswordFormContent } from '../forms/forgot-password-form';
import { AuthCard } from '../shared/auth-card';

export function ForgotPasswordCard({
    isPending,
    successMessage,
    errorMessage,
}: {
    isPending: boolean;
    successMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
}) {
    return (
        <AuthCard
            cardTitle="Forgot your password?"
            cardDescription="Enter your email address to reset your password."
        >
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
                <ForgotPasswordFormContent isPending={isPending} />
            </CardContent>
            <CardFooter>
                <LoadingButton isLoading={isPending} type="submit" className="w-full">
                    Request Password Reset
                </LoadingButton>
            </CardFooter>
        </AuthCard>
    );
}

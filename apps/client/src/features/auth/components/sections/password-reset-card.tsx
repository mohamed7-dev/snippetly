import { LoadingButton } from '@/components/inputs/loading-button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { PasswordResetForm } from '../forms/password-reset-form';
import { AuthCard } from '../shared/auth-card';

export function PasswordResetCard({ isPending }: { isPending: boolean }) {
    return (
        <AuthCard
            cardTitle="Reset Your Password?"
            cardDescription="Enter the token sent to your email, and the new password."
        >
            <CardContent>
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

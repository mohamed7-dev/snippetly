import { LoadingButton } from '@/components/inputs/loading-button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Link } from '@tanstack/react-router';
import { AccountRegistrationForm } from '../forms/account-registration-form';
import { AuthCard } from '../shared/auth-card';

export function AccountRegistrationCard({ isPending }: { isPending: boolean }) {
    return (
        <AuthCard
            cardTitle="Create your account"
            cardDescription="Join thousands of developers organizing their code"
        >
            <CardContent>
                <AccountRegistrationForm isPending={isPending} />
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <div className="self-start text-sm mt-4">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link to={'/sign-in'} className="text-primary hover:underline font-medium">
                        Sign in
                    </Link>
                </div>
                <Field orientation={'horizontal'}>
                    <LoadingButton isLoading={isPending} type="submit" className="w-full">
                        Register Account
                    </LoadingButton>
                </Field>
            </CardFooter>
        </AuthCard>
    );
}

import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
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
                <div className="self-start flex items-center">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Button variant={'link'} asChild>
                        <Link to={'/sign-in'}>Sign in</Link>
                    </Button>
                </div>
                <LoadingButton size={'lg'} isLoading={isPending} type="submit" className="w-full">
                    Register Account
                </LoadingButton>
            </CardFooter>
        </AuthCard>
    );
}

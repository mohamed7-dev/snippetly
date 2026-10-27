import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import type { UserType } from '@/lib/types';
import { Link, useSearch } from '@tanstack/react-router';
import { SignInFormContent } from '../forms/sign-in-form';
import { AuthCard } from '../shared/auth-card';
import { GoogleAuthButton } from '../shared/google-auth-button';

export function SignInCard({ userType, isPending }: { userType: UserType; isPending: boolean }) {
    const { redirect } = useSearch({ from: '/(auth)/_auth-layout/sign-in' });

    return (
        <AuthCard
            cardTitle="Welcome back"
            cardDescription="Sign in to your account to access your code snippets"
        >
            <CardContent>
                <SignInFormContent userType={userType} isPending={isPending} />
            </CardContent>
            <CardFooter className="flex-col gap-4">
                {userType === 'developer' && (
                    <div className="self-start flex items-center text-sm">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <Button variant={'link'} asChild>
                            <Link to={'/register-account'}>Register Account</Link>
                        </Button>
                    </div>
                )}
                <LoadingButton isLoading={isPending} type="submit" className="w-full">
                    Sign In
                </LoadingButton>
                <GoogleAuthButton redirect={redirect} />
            </CardFooter>
        </AuthCard>
    );
}

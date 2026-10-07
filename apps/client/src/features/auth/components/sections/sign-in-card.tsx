import { LoadingButton } from '@/components/inputs/loading-button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import type { UserType } from '@/lib/types';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/use-auth';
import { SignInFormContent } from '../forms/sign-in-form';
import { AuthCard } from '../shared/auth-card';

export function SignInCard({
    userType,
    isVerifying,
    isPending,
}: {
    userType: UserType;
    isVerifying: boolean;
    isPending: boolean;
}) {
    const { errorMessage } = useAuth();

    React.useEffect(() => {
        if (errorMessage && !isVerifying) {
            toast.error(errorMessage);
        }
    }, [errorMessage, isVerifying]);

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
                    <div className="self-start text-center text-sm mt-4">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <Link to={'/register-account'} className="text-primary hover:underline font-medium">
                            Register Account
                        </Link>
                    </div>
                )}
                <Field orientation={'horizontal'}>
                    <LoadingButton isLoading={isPending} type="submit" className="w-full">
                        Sign In
                    </LoadingButton>
                </Field>
            </CardFooter>
        </AuthCard>
    );
}

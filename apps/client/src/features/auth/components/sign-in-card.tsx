import { LoadingButton } from '@/components/inputs/loading-button';
import { PasswordField } from '@/components/inputs/password-field';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { UserType } from '@/lib/types';
import type { AuthenticateDeveloperDtoType } from '@snippetly/common/dto';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/use-auth';
import { developerAuthenticationFormSchema, type DeveloperAuthenticationFormSchema } from '../lib/schema';
import { AuthCard } from './auth-card';

export function SignInCard({ userType, isVerifying }: { userType: UserType; isVerifying: boolean }) {
    const { login, errorMessage } = useAuth();
    const navigate = useNavigate();
    const { redirect: from } = useSearch({
        from: '/(auth)/_auth-layout/sign-in',
    });

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (input: AuthenticateDeveloperDtoType['input']) => {
            return login(input, userType, () => {
                toast.success('Authenticated Successfully');
                if (!from) {
                    navigate({
                        to: '/dashboard',
                        replace: true,
                    });
                } else {
                    navigate({
                        href: from,
                        replace: true,
                    });
                }
            });
        },
    });

    const onSubmit = async (values: DeveloperAuthenticationFormSchema) => {
        await mutateAsync(values);
    };

    const loginForm = useForm({
        defaultValues: {
            native: {
                identifier: '',
                password: '',
                rememberMe: false,
            },
        },
        validators: {
            onSubmit: developerAuthenticationFormSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value);
        },
    });

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
                <form
                    id="signin-form"
                    className="space-y-4"
                    autoComplete="off"
                    onSubmit={async e => {
                        e.preventDefault();
                        await loginForm.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        <loginForm.Field
                            name="native.identifier"
                            children={field => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            {userType === 'developer' ? 'Email Address' : 'User Name'}
                                            <sup className="text-sm">*</sup>
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={e => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder={
                                                userType === 'developer' ? 'test@example.com' : 'test'
                                            }
                                            autoComplete="off"
                                        />
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                );
                            }}
                        />
                        <loginForm.Field
                            name="native.password"
                            children={field => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Password<sup className="text-sm">*</sup>
                                        </FieldLabel>
                                        <PasswordField
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={e => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder={'*'.repeat(12)}
                                            autoComplete="off"
                                        />
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                );
                            }}
                        />
                        <div className="flex items-center justify-between">
                            <loginForm.Field
                                name="native.rememberMe"
                                children={field => {
                                    return (
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="remember-me-field"
                                                checked={field.state.value}
                                                onCheckedChange={checked =>
                                                    field.setValue(checked as boolean)
                                                }
                                            />
                                            <FieldLabel
                                                htmlFor="remember-me-field"
                                                className="text-sm truncate overflow-x-auto"
                                            >
                                                Remember Me
                                            </FieldLabel>
                                        </Field>
                                    );
                                }}
                            />
                            <Button className="flex-1" variant={'link'} asChild>
                                <Link to={'/forgot-password'} className="text-sm text-primary">
                                    Forgot password?
                                </Link>
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
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
                    <LoadingButton isLoading={isPending} type="submit" form="signin-form" className="w-full">
                        Sign In
                    </LoadingButton>
                </Field>
            </CardFooter>
        </AuthCard>
    );
}

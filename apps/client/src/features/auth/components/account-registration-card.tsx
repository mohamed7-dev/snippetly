import { LoadingButton } from '@/components/inputs/loading-button';
import { PasswordField } from '@/components/inputs/password-field';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { RegisterDeveloperAccountDtoType } from '@snippetly/common/dto';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuth } from '../hooks/use-auth';
import {
    developerAccountRegistrationFormSchema,
    type DeveloperAccountRegistrationFormSchema,
} from '../lib/schema';
import { AuthCard } from './auth-card';

export function AccountRegistrationCard() {
    const { login: authenticateDeveloper } = useAuth();
    const navigate = useNavigate();

    const { redirect: from } = useSearch({
        from: '/(auth)/_auth-layout/register-account',
    });

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (input: RegisterDeveloperAccountDtoType['input']) => {
            return await developerApiClient.fetch<RegisterDeveloperAccountDtoType['output']>(
                apiEndpoints.auth.registerDeveloper.url,
                {
                    method: apiEndpoints.auth.registerDeveloper.method,
                    body: JSON.stringify(input),
                },
            );
        },
        onSuccess: (_data, variables) => {
            toast.success('Account was registered successfully');
            authenticateDeveloper(
                {
                    native: { identifier: variables.emailAddress, password: variables.password },
                },
                'developer',
                () => {
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
                },
            );
        },
        onError: toastApiError,
    });

    const onSubmit = async (values: DeveloperAccountRegistrationFormSchema) => {
        await mutateAsync({
            firstName: values.firstName,
            lastName: values.lastName,
            emailAddress: values.emailAddress,
            password: values.password,
            isPrivate: values.isPrivate,
        });
    };

    const signupForm = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            emailAddress: '',
            password: '',
            isPrivate: false,
        },
        validators: {
            onSubmit: developerAccountRegistrationFormSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value);
        },
    });
    return (
        <AuthCard
            cardTitle="Create your account"
            cardDescription="Join thousands of developers organizing their code"
        >
            <CardContent>
                <form
                    id="register-developer-account"
                    className="flex flex-col gap-6"
                    onSubmit={e => {
                        e.preventDefault();
                        signupForm.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        <FieldGroup className="flex-col md:flex-row">
                            <signupForm.Field
                                name="firstName"
                                children={field => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                First Name<sup className="text-sm">*</sup>
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={e => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="john"
                                                autoComplete="off"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    );
                                }}
                            />
                            <signupForm.Field
                                name="lastName"
                                children={field => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Last Name<sup className="text-sm">*</sup>
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={e => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="doe"
                                                autoComplete="off"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    );
                                }}
                            />
                        </FieldGroup>
                        <signupForm.Field
                            name="emailAddress"
                            children={field => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Email Address<sup className="text-sm">*</sup>
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={e => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            inputMode="email"
                                            type="email"
                                            placeholder="test@example.com"
                                            autoComplete="off"
                                        />
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                );
                            }}
                        />
                        <signupForm.Field
                            name="password"
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
                    </FieldGroup>

                    <FieldGroup>
                        <signupForm.Field
                            name="isPrivate"
                            children={field => {
                                return (
                                    <Field orientation="horizontal">
                                        <Checkbox
                                            id="is-private-field"
                                            checked={field.state.value}
                                            onCheckedChange={checked => field.setValue(checked as boolean)}
                                        />
                                        <FieldLabel
                                            htmlFor="is-private-field"
                                            className="text-sm truncate overflow-x-auto"
                                        >
                                            Make account private?
                                        </FieldLabel>
                                    </Field>
                                );
                            }}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <div className="self-start text-sm mt-4">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link to={'/sign-in'} className="text-primary hover:underline font-medium">
                        Sign in
                    </Link>
                </div>
                <Field orientation={'horizontal'}>
                    <LoadingButton
                        isLoading={isPending}
                        type="submit"
                        form="register-developer-account"
                        className="w-full"
                    >
                        Register Account
                    </LoadingButton>
                </Field>
            </CardFooter>
        </AuthCard>
    );
}

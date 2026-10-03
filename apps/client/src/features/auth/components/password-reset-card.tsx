import { LoadingButton } from '@/components/inputs/loading-button';
import { PasswordField } from '@/components/inputs/password-field';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { PageLoader } from '@/components/views/page-loading-view';
import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { ResetPasswordDtoType } from '@snippetly/common/dto';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { developerResetPasswordFormSchema, type DeveloperResetPasswordFormSchema } from '../lib/schema';
import { AuthCard } from './auth-card';

export function PasswordResetCard() {
    const navigate = useNavigate();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (input: ResetPasswordDtoType['input']) => {
            return await developerApiClient.fetch<ResetPasswordDtoType['output']>(
                apiEndpoints.auth.resetPassword.url,
                {
                    method: apiEndpoints.auth.resetPassword.method,
                    body: JSON.stringify(input),
                },
            );
        },
        onSuccess: () => {
            navigate({ to: '/sign-in' });
        },
        onError: toastApiError,
    });

    const { token } = useSearch({
        from: '/(auth)/_auth-layout/password-reset',
    });

    const onSubmit = async (values: DeveloperResetPasswordFormSchema) => {
        await mutateAsync({ token, newPassword: values.newPassword });
    };

    const resetPasswordForm = useForm({
        defaultValues: {
            token: token,
            newPassword: '',
        },
        validators: {
            onSubmit: developerResetPasswordFormSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value);
        },
    });
    return (
        <AuthCard
            cardTitle="Reset Your Password?"
            cardDescription="Enter the token sent to your email, and the new password."
        >
            <CardContent>
                {isPending && <PageLoader iconProps={{ className: 'size-12' }} />}
                {/* {!!data?.message && <ProcessStatus title="Success" description={data.message} />} */}
                {/* {!!error && (
                    <ProcessStatus
                        variant={'destructive'}
                        title={error.response?.statusText ?? error.name}
                        description={error?.response?.data.message ?? error.message}
                    />
                )} */}
                <form
                    onSubmit={async e => {
                        e.preventDefault();
                        await resetPasswordForm.handleSubmit();
                    }}
                    autoComplete="off"
                    id="reset-password-form"
                    className="space-y-6"
                >
                    <FieldGroup>
                        <resetPasswordForm.Field
                            name="newPassword"
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
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation={'horizontal'}>
                    <LoadingButton
                        isLoading={isPending}
                        disabled={isPending}
                        type="submit"
                        form="reset-password-form"
                        className="w-full"
                    >
                        Reset Password
                    </LoadingButton>
                </Field>
            </CardFooter>
        </AuthCard>
    );
}

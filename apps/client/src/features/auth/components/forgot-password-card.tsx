import { LoadingButton } from '@/components/inputs/loading-button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/views/page-loading-view';
import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { RequestPasswordResetDtoType } from '@snippetly/common/dto';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
    developerPasswordResetRequestFormSchema,
    type DeveloperPasswordResetRequestFormSchema,
} from '../lib/schema';
import { AuthCard } from './auth-card';

export function ForgotPasswordCard() {
    const navigate = useNavigate();
    const qClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (input: RequestPasswordResetDtoType['input']) => {
            return await developerApiClient.fetch<RequestPasswordResetDtoType['output']>(
                apiEndpoints.auth.requestPasswordReset.url,
                {
                    method: apiEndpoints.auth.requestPasswordReset.method,
                    body: JSON.stringify(input),
                },
            );
        },
        onSuccess: () => {
            navigate({ to: '/dashboard/settings' });
            qClient.invalidateQueries({ queryKey: ['users', 'profiles', 'current'] });
        },
        onError: toastApiError,
    });

    const onSubmit = async (values: DeveloperPasswordResetRequestFormSchema) => {
        await mutateAsync({ emailAddress: values.emailAddress });
    };

    const sendResetTokenForm = useForm({
        defaultValues: {
            emailAddress: '',
        },
        validators: {
            onSubmit: developerPasswordResetRequestFormSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value);
        },
    });

    return (
        <AuthCard
            cardTitle="Forgot your password?"
            cardDescription="Enter your verified email address to reset your password."
        >
            <CardContent>
                {isPending && <PageLoader iconProps={{ className: 'size-12' }} />}
                {/* {!!data?.message && <ProcessStatus title="Success" description={data.message} />}
                {!!error && (
                    <ProcessStatus
                        variant={'destructive'}
                        title={error.response?.statusText ?? error.name}
                        description={error?.response?.data.message ?? error.message}
                    />
                )} */}

                <form
                    id="send-reset-token-form"
                    onSubmit={async e => {
                        e.preventDefault();
                        await sendResetTokenForm.handleSubmit();
                    }}
                    autoComplete="off"
                    className="space-y-6"
                >
                    <FieldGroup>
                        <sendResetTokenForm.Field
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
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation={'horizontal'}>
                    <LoadingButton
                        isLoading={isPending}
                        disabled={isPending}
                        type="submit"
                        form="send-reset-token-form"
                        className="w-full"
                    >
                        Request Password Reset
                    </LoadingButton>
                </Field>
            </CardFooter>
        </AuthCard>
    );
}

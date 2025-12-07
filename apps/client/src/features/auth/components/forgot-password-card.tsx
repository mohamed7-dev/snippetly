import { ProcessStatus } from '@/components/feedback/process-status'
import { LoadingButton } from '@/components/inputs/loading-button'
import { PageLoader } from '@/components/loaders/page-loader'
import { CardContent, CardFooter } from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useSendResetToken } from '../hooks/use-send-reset-token'
import { sendResetTokenSchema, type SendResetTokenSchema } from '../lib/schema'
import { AuthCard } from './auth-card'

export function ForgotPasswordCard() {
  const navigate = useNavigate()
  const qClient = useQueryClient()

  const {
    mutateAsync: sendResetToken,
    isPending,
    data,
    error,
  } = useSendResetToken({
    onSuccess: () => {
      navigate({ to: '/dashboard/settings' })
      qClient.invalidateQueries({ queryKey: ['users', 'profiles', 'current'] })
    },
  })

  const onSubmit = async (values: SendResetTokenSchema) => {
    await sendResetToken(values)
  }

  const sendResetTokenForm = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: sendResetTokenSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
    <AuthCard
      cardTitle="Forgot your password?"
      cardDescription="Enter your verified email address to reset your password."
    >
      <CardContent>
        {isPending && <PageLoader iconProps={{ className: 'size-12' }} />}
        {!!data?.message && (
          <ProcessStatus title="Success" description={data.message} />
        )}
        {!!error && (
          <ProcessStatus
            variant={'destructive'}
            title={error.response?.statusText ?? error.name}
            description={error?.response?.data.message ?? error.message}
          />
        )}

        <form
          id="send-reset-token-form"
          onSubmit={async (e) => {
            e.preventDefault()
            await sendResetTokenForm.handleSubmit()
          }}
          autoComplete="off"
          className="space-y-6"
        >
          <FieldGroup>
            <sendResetTokenForm.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Email<sup className="text-sm">*</sup>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      inputMode="email"
                      type="email"
                      placeholder="test@example.com"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
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
            Send Reset Token
          </LoadingButton>
        </Field>
      </CardFooter>
    </AuthCard>
  )
}

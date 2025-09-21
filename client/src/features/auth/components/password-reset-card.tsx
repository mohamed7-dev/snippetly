import { AuthCard } from './auth-card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { LoadingButton } from '@/components/inputs/loading-button'
import { ProcessStatus } from '@/components/feedback/process-status'
import { PageLoader } from '@/components/loaders/page-loader'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useResetPassword } from '../hooks/use-reset-password'
import { useForm } from 'react-hook-form'
import { resetPasswordSchema, type ResetPasswordSchema } from '../lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { PasswordField } from '@/components/inputs/password-field'

export function PasswordResetCard() {
  const navigate = useNavigate()

  const {
    mutateAsync: resetPassword,
    isPending,
    data,
    error,
  } = useResetPassword({
    onSuccess: () => {
      navigate({ to: '/login' })
    },
  })

  const { token } = useSearch({
    from: '/(auth)/(auth-layout)/_auth-layout/password-reset',
  })
  const resetPasswordForm = useForm<ResetPasswordSchema>({
    defaultValues: {
      token: token,
      password: '',
    },
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (values: ResetPasswordSchema) => {
    await resetPassword(values)
  }
  return (
    <AuthCard
      cardTitle="Reset Your Password?"
      cardDescription="Enter the token sent to your email, and the new password."
    >
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
      <Form {...resetPasswordForm}>
        <form
          onSubmit={resetPasswordForm.handleSubmit(onSubmit)}
          autoComplete="off"
          className="space-y-6"
        >
          <FormField
            control={resetPasswordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordField
                    disabled={isPending}
                    placeholder="************"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton
            isLoading={isPending}
            disabled={isPending}
            type="submit"
            className="w-full"
          >
            Reset Password
          </LoadingButton>
        </form>
      </Form>
    </AuthCard>
  )
}

import { AuthCard } from './auth-card'
import { useSendResetToken } from '../hooks/use-send-reset-token'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { sendResetTokenSchema, type SendResetTokenSchema } from '../lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { LoadingButton } from '@/components/inputs/loading-button'
import { ProcessStatus } from '@/components/feedback/process-status'
import { PageLoader } from '@/components/loaders/page-loader'

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
  const sendResetTokenForm = useForm<SendResetTokenSchema>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(sendResetTokenSchema),
  })

  const onSubmit = async (values: SendResetTokenSchema) => {
    await sendResetToken(values)
  }
  return (
    <AuthCard
      cardTitle="Forgot your password?"
      cardDescription="Enter your verified email address to reset your password."
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
      <Form {...sendResetTokenForm}>
        <form onSubmit={sendResetTokenForm.handleSubmit(onSubmit)}>
          <FormField
            control={sendResetTokenForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token</FormLabel>
                <FormControl>
                  <Input disabled={isPending} placeholder="token" {...field} />
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
            Send Reset Token
          </LoadingButton>
        </form>
      </Form>
    </AuthCard>
  )
}

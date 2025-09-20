import { AuthCard } from './auth-card'
import { useVerifyEmail } from '../hooks/use-verify-email'
import { PageLoader } from '@/components/loaders/page-loader'
import { ProcessStatus } from '@/components/feedback/process-status'
import { useSearch } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'sonner'

export function EmailVerificationCard() {
  const { token } = useSearch({
    from: '/(auth)/(auth-layout)/_auth-layout/email-verification',
  })
  const qClient = useQueryClient()
  const {
    mutateAsync: verifyEmail,
    isPending,
    data,
    error,
  } = useVerifyEmail({
    onSuccess: () => {
      toast.success('Email verified successfully.')
      qClient.invalidateQueries({ queryKey: ['users', 'profiles', 'current'] })
    },
    onError: (error) => {
      toast.error(error.response?.data.message)
    },
  })

  React.useEffect(() => {
    const submit = async () => {
      await verifyEmail({ token })
    }
    if (token && token.length) {
      submit()
    }
  }, [])

  return (
    <AuthCard
      cardTitle="Email Verification"
      cardDescription="Verify your email."
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
    </AuthCard>
  )
}

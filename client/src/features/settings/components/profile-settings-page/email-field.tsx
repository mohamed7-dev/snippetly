import { LoadingButton } from '@/components/inputs/loading-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSendVerificationToken } from '@/features/auth/hooks/use-send-verification-token'
import { useUpdateProfile } from '@/features/user/hooks/use-update-profile'
import { getCurrentUserProfileOptions } from '@/features/user/lib/api'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { CheckIcon, MailIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

export function EmailField() {
  const { data } = useSuspenseQuery(getCurrentUserProfileOptions)
  const profile = data.data.profile
  const [isUpdateTriggered, setIsUpdateTriggered] = React.useState(false)
  const [email, setEmail] = React.useState(profile.email)
  const isEmailDirty = profile.email !== email

  const qClient = useQueryClient()
  const { mutateAsync: sendVerificationEmail, isPending } =
    useSendVerificationToken({
      onSuccess: (data) => {
        toast.success(data.message)
      },
      onError: (error) => {
        toast.error(error.response?.data.message)
      },
    })

  const {
    mutateAsync: updateProfile,
    isPending: isUpdating,
    reset,
  } = useUpdateProfile({
    onSuccess: (data) => {
      toast.success(data.message)
      qClient.invalidateQueries({
        queryKey: ['users', 'profiles', 'current'],
      })
      setIsUpdateTriggered(true)
      reset()
    },
    onError: (error) => {
      toast.error(error.response?.data.message)
    },
  })

  const handleSendVerificationEmail = async () => {
    await sendVerificationEmail({ email })
  }

  const handleUpdateProfile = async () => {
    await updateProfile({ email })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailIcon className="h-5 w-5" />
          Email Settings
        </CardTitle>
        <CardDescription>
          Manage your email address and verification status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Email Address</Label>
            <div className="flex items-center gap-2">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="max-w-sm"
              />
              {profile.emailVerifiedAt ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="destructive">Unverified</Badge>
              )}
            </div>
          </div>
        </div>

        {!profile.emailVerifiedAt && (
          <Alert>
            <MailIcon className="h-4 w-4" />
            <AlertDescription>
              Your email address is not verified.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <LoadingButton
            isLoading={isPending}
            disabled={
              isPending ||
              isUpdating ||
              (!isEmailDirty && !!profile.emailVerifiedAt) ||
              (isEmailDirty && !isUpdateTriggered)
            }
            variant="outline"
            onClick={handleSendVerificationEmail}
          >
            {profile.emailVerifiedAt
              ? 'Resend Verification'
              : 'Send Verification Email'}
          </LoadingButton>
          <LoadingButton
            isLoading={isUpdating}
            disabled={isUpdating || isPending || !isEmailDirty}
            onClick={handleUpdateProfile}
          >
            Update Email
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  )
}

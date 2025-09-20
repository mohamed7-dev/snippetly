import { ProcessStatus } from '@/components/feedback/process-status'
import { LoadingButton } from '@/components/inputs/loading-button'
import { PasswordField } from '@/components/inputs/password-field'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useUpdateProfile } from '@/features/user/hooks/use-update-profile'
import { ShieldIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

export function PasswordResetField() {
  const [form, setForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  })
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const {
    mutateAsync: updateProfile,
    isPending: isUpdating,
    reset,
  } = useUpdateProfile({
    onSuccess: (data) => {
      toast.success(data.message)
      reset()
    },
    onError: (error) => {
      toast.error(error.response?.data.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await updateProfile({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    })
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldIcon className="h-5 w-5" />
          Password & Security
        </CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <PasswordField
              id="currentPassword"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordField
              id="newPassword"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <PasswordField
              id="confirmPassword"
              name="newPasswordConfirm"
              value={form.newPasswordConfirm}
              onChange={handleChange}
              placeholder="Confirm your new password"
              disabled={isUpdating}
            />
          </div>

          {form.newPassword &&
            form.newPasswordConfirm &&
            form.newPassword !== form.newPasswordConfirm && (
              <ProcessStatus
                title=""
                variant={'destructive'}
                description={'Passwords do not match. Please try again.'}
              />
            )}

          <div className="pt-2">
            <LoadingButton
              isLoading={isUpdating}
              type="submit"
              disabled={
                isUpdating ||
                !form.currentPassword ||
                !form.newPassword ||
                !form.newPasswordConfirm ||
                form.newPassword !== form.newPasswordConfirm
              }
            >
              Update Password
            </LoadingButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

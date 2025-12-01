import { ProcessStatus } from '@/components/feedback/process-status'
import { LoadingButton } from '@/components/inputs/loading-button'
import { useDeleteConfirmation } from '@/components/providers/delete-confirmation-provider'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/features/auth/components/auth-provider'
import { authStore } from '@/features/auth/lib/auth-store'
import { useDeleteAccount } from '@/features/user/hooks/use-delete-account'
import { useNavigate } from '@tanstack/react-router'
import { Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteAccountSettings() {
  const { confirm, resetAndClose } = useDeleteConfirmation()
  const { logout } = useAuth()

  const navigate = useNavigate()
  const { mutateAsync: deleteAccount, isPending } = useDeleteAccount({
    onSuccess: () => {
      resetAndClose?.()
      navigate({ to: '/goodbye', search: { 'redirected-from-delete': true } })
      logout()
      authStore.setAccessToken(null)
    },
    onError: (err) => {
      toast.error(err.response?.data.message)
    },
  })

  const handleDelete = () => {
    confirm({
      title: 'Account Deletion',
      description:
        'Deleting your account will permanently remove all your snippets, collections, and profile data. This action is irreversible.',
      onConfirm: async () => await deleteAccount(),
      isPending: isPending,
    })
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2Icon className="h-5 w-5" />
          Delete Account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProcessStatus
          variant={'destructive'}
          showCloseButton={false}
          title="Account Deletion"
          description={
            <p>
              <strong>Warning:</strong> Deleting your account will permanently
              remove all your snippets, collections, and profile data. This
              action is irreversible.
            </p>
          }
        />
        <LoadingButton
          variant="destructive"
          className="w-full sm:w-auto"
          onClick={handleDelete}
          disabled={isPending}
          isLoading={isPending}
        >
          Delete My Account
        </LoadingButton>
      </CardContent>
    </Card>
  )
}

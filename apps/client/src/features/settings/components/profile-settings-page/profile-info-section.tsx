import { ProcessStatus } from '@/components/feedback/process-status'
import { LoadingButton } from '@/components/inputs/loading-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { getCurrentUserProfileOptions } from '@/features/user/lib/api'
import {
  updateProfileSchema,
  type UpdateProfileSchema,
} from '@/features/user/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { UserIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useUpdateProfile } from '../../../user/hooks/use-update-profile'
import { AvatarSection } from './avatar-section'

export function ProfileInfoSection() {
  const { data } = useSuspenseQuery(getCurrentUserProfileOptions)
  const profile = data.data.profile

  const updateProfileForm = useForm<UpdateProfileSchema>({
    defaultValues: {
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      bio: profile.bio ?? '',
    },
    resolver: zodResolver(updateProfileSchema),
  })
  const imageError = updateProfileForm.watch('imageError')

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile({
    onSuccess: (data) => {
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.response?.data.message)
    },
  })

  const onSubmit = async ({
    firstName,
    lastName,
    bio,
  }: UpdateProfileSchema) => {
    await updateProfile({ firstName, lastName, bio })
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!!imageError && (
          <ProcessStatus
            variant={'destructive'}
            title={imageError.code}
            description={imageError.message}
            onClose={() => updateProfileForm.setValue('imageError', undefined)}
          />
        )}

        <Form {...updateProfileForm}>
          <AvatarSection />
          <Separator />
          <form
            onSubmit={updateProfileForm.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={updateProfileForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your first name"
                        {...field}
                        value={field.value ?? undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateProfileForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your last name"
                        {...field}
                        value={field.value ?? undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={updateProfileForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us more about your self"
                      rows={4}
                      className="resize-none"
                      {...field}
                      value={field.value ?? undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              isLoading={isPending}
              type="submit"
              disabled={isPending}
            >
              Update Profile
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

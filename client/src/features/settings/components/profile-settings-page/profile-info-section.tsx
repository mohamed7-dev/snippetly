import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CameraIcon, UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { LoadingButton } from '@/components/inputs/loading-button'
import { useUpdateProfile } from '../../../user/hooks/use-update-profile'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  updateProfileSchema,
  type UpdateProfileSchema,
} from '@/features/user/lib/schema'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCurrentUserProfileOptions } from '@/features/user/lib/api'
import { mbToBytesBinary } from '@/lib/utils'
import { toast } from 'sonner'
import { ProcessStatus } from '@/components/feedback/process-status'

export function ProfileInfoSection() {
  const { data } = useSuspenseQuery(getCurrentUserProfileOptions)
  const profile = data.data.profile

  const updateProfileForm = useForm<UpdateProfileSchema>({
    defaultValues: {
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
    },
    resolver: zodResolver(updateProfileSchema),
  })
  const imageError = updateProfileForm.watch('imageError')

  const validateImage = (file: File) => {
    const isSizeLarge = file?.size > mbToBytesBinary(1)
    const isMediaValid = [
      'image/jpeg',
      'image/jpeg',
      'image/png',
      'image/svg',
    ].includes(file.type)

    if (isSizeLarge) {
      updateProfileForm.setValue('imageError', {
        code: 'file-too-large',
        message: 'File must not exceed 1 mb.',
      })
      return false
    } else if (!isMediaValid) {
      updateProfileForm.setValue('imageError', {
        code: 'invalid-type',
        message:
          'Invalid media type, only jpeg, jpeg, png, and svg images are allowed.',
      })
      return false
    }
    return true
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const isValid = validateImage(file)
      if (!isValid) return false
      updateProfileForm.setValue('image', file)
      const reader = new FileReader()
      reader.onload = (e) => {
        updateProfileForm.setValue('imagePreview', e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile({
    onSuccess: (data) => {
      toast.success(data.message)
      console.log(data)
    },
    onError: (error) => {
      toast.error(error.response?.data.message)
    },
  })

  const onSubmit = async ({
    firstName,
    lastName,
    image,
  }: UpdateProfileSchema) => {
    await updateProfile({ firstName, lastName, image })
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
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={
                updateProfileForm.watch('imagePreview') ||
                profile.image ||
                '/placeholder.svg'
              }
              alt="Profile"
            />
            <AvatarFallback>{profile.username}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="profile-image" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                <CameraIcon className="h-4 w-4" />
                Change Photo
              </div>
            </Label>
            <Input
              id="profile-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <p className="text-xs text-muted-foreground">
              JPG, JPEG, PNG, SVG . Max size 1MB.
            </p>
          </div>
        </div>

        <Separator />

        <Form {...updateProfileForm}>
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
                      <Input placeholder="Enter your first name" {...field} />
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
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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

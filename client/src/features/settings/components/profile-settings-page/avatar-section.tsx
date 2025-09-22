import { UploadButton } from '@/components/feedback/upload-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/features/auth/components/auth-provider'
import { refreshAccessToken } from '@/features/auth/lib/api'
import { authStore } from '@/features/auth/lib/auth-store'
import { getCurrentUserProfileOptions } from '@/features/user/lib/api'
import type { UpdateProfileSchema } from '@/features/user/lib/schema'
import { serverEndpoints } from '@/lib/routes'
import { mbToBytesBinary } from '@/lib/utils'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

export function AvatarSection() {
  const { data } = useSuspenseQuery(getCurrentUserProfileOptions)
  const profile = data.data.profile
  const qClient = useQueryClient()
  const updateProfileForm: UseFormReturn<UpdateProfileSchema> = useFormContext()

  const { accessToken, updateAccessToken } = useAuth()
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

  const handleImageUpload = (files: File[]) => {
    const file = files?.[0]
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
  return (
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
        <UploadButton
          config={{
            cn: twMerge,
          }}
          headers={{
            ...(accessToken
              ? { Authorization: 'Bearer '.concat(accessToken) }
              : {}),
          }}
          endpoint={serverEndpoints.uploadAvatar}
          onBeforeUploadBegin={async (files) => {
            handleImageUpload(files)
            if (!accessToken) {
              await refreshAccessToken().then((data) => {
                updateAccessToken(data.data.data.accessToken)
                authStore.setAccessToken(data.data.data.accessToken)
              })
            }
            return files
          }}
          onClientUploadComplete={() => {
            toast.success('Avatar image has been updated successfully.')
            qClient.invalidateQueries({
              queryKey: ['users', 'profiles', 'current'],
            })
          }}
          onUploadError={(e) => {
            toast.error(e.message)
          }}
        />

        {/* commented this code because the server uses uploadthing to handle uploading  */}
        {/* <Label htmlFor="profile-image" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-xs sm:text-sm">
                <CameraIcon className="h-4 w-4" />
                Change Photo
              </div>
            </Label> */}
        {/* <Input
              id="profile-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            /> */}
        <p className="text-xs text-muted-foreground">
          JPG, JPEG, PNG, SVG . Max size 1MB.
        </p>
      </div>
    </div>
  )
}

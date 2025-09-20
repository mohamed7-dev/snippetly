import { STRONG_PASSWORD_SCHEMA } from '@/lib/zod'
import z from 'zod'

export const updateProfileSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    image: z.instanceof(File),
    imagePreview: z.string(),
    imageError: z.object({
      code: z.enum(['file-too-large', 'invalid-type']),
      message: z.string(),
    }),
    email: z.string().email(),
    currentPassword: STRONG_PASSWORD_SCHEMA,
    newPassword: STRONG_PASSWORD_SCHEMA,
  })
  .partial()
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>

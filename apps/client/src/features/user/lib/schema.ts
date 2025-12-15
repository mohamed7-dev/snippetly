import { UpdateUserRequestDto } from '@snippetly/common/dto'
import z from 'zod'

export const updateProfileSchema = UpdateUserRequestDto.omit({
  image: true,
})
  .extend({
    image: z.instanceof(File),
    imagePreview: z.string(),
    imageError: z.object({
      code: z.enum(['file-too-large', 'invalid-type']),
      message: z.string(),
    }),
  })
  .partial()

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>

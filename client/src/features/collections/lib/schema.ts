import z from 'zod'

export const createCollectionSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().optional(),
  color: z.string().nonempty(),
  isPublic: z.boolean(),
  allowForking: z.boolean(),
  tags: z.array(z.string()).optional(),
})

export type CreateCollectionSchema = z.infer<typeof createCollectionSchema>

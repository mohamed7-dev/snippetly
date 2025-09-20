import z from 'zod'

export const createCollectionSchema = z.object({
  title: z.string().nonempty(),
  color: z.string().nonempty(),
  description: z.string().optional(),
  isPublic: z.boolean(),
  allowForking: z.boolean(),
  tags: z.array(z.string()).optional(),
})

export type CreateCollectionSchema = z.infer<typeof createCollectionSchema>

// Edit Collection
export const updateCollectionSchema = createCollectionSchema
  .omit({ tags: true })
  .extend({
    addTags: z.array(z.string()),
    removeTags: z.array(z.string()),
  })
  .partial()

export type UpdateCollectionSchema = z.infer<typeof updateCollectionSchema>

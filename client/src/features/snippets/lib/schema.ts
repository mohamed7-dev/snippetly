import z from 'zod'

export const createSnippetSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().optional(),
  note: z.string().optional(),
  language: z.string().nonempty(),
  code: z.string().nonempty(),
  isPrivate: z.boolean(),
  allowForking: z.boolean(),
  tags: z.array(z.string()).optional(),
  collection: z.string(),
})
export type CreateSnippetSchema = z.infer<typeof createSnippetSchema>

// Edit Snippet
export const editSnippetSchema = createSnippetSchema
  .omit({ tags: true })
  .extend({
    addTags: z.array(z.string()).optional(),
    removeTags: z.array(z.string()).optional(),
  })
  .partial()

export type EditSnippetSchema = z.infer<typeof editSnippetSchema>

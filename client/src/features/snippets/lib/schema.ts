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

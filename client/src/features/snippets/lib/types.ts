export interface Snippet {
  title: string
  slug: string
  description: string
  code: string
  id: string
  createdAt: string
  updatedAt: string
  isPrivate: boolean
  allowForking: boolean
  tags: string[]
}

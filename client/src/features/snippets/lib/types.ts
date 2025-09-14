export interface Snippet {
  id: number
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
  description: string | null
  title: string
  slug: string
  allowForking: boolean
  forkedFrom: number | null
  creatorId: number
  code: string
  language: string
  collectionId: number
}

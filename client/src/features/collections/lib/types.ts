export interface Collection {
  id: number
  title: string
  slug: string
  description: string | null
  color: string
  isPrivate: boolean
  allowForking: boolean
  forkedFrom: number | null
  createdAt: Date
  updatedAt: Date
  creatorId: number
}

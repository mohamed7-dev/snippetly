export interface Snippet {
  isPrivate: boolean
  addedAt: string
  lastUpdatedAt: string
  description: string | null
  note: string | null
  title: string
  publicId: string
  allowForking: boolean
  isForked: boolean
  code: string
  language: string
  collectionPublicId: string
  creatorName: string
}

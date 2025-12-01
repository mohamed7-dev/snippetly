export interface Collection {
  title: string
  publicId: string
  description: string | null
  color: string
  isPrivate: boolean
  allowForking: boolean
  isForked: boolean
  addedAt: string
  lastUpdatedAt: string
  creatorName: string
}

export type CollectionStats = {
  totalCollections: number
  publicCollections: number
  totalSnippets: number
  forkedCollections: number
}

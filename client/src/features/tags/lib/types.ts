export interface Tag {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
  usageCount: number
  addedBy: number | null
}

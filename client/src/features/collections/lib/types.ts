export interface Collection {
  id: string
  title: string
  code: string
  color: string
  description: string
  isPrivate?: boolean
  allowForking: boolean
}

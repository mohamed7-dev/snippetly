export type ErrorResponse = {
  message: string
  cause?: unknown
}

export type SharedSuccessRes<T> = {
  message: string
  data: T
}

export type SharedPaginatedSuccessRes<T, C = null> = {
  message: string
  items: T
  nextCursor: C
  total?: number
}

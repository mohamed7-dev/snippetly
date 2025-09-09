export type ErrorResponse = {
  message: string
  cause?: unknown
}

export type SharedSuccessRes<T> = {
  message: string
  data: T
}

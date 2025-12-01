import { API_SERVER_URL } from '@/lib/api'
import { generateUploadButton } from '@uploadthing/react'

export const UploadButton = generateUploadButton({
  url: `${API_SERVER_URL}/upload`,
})

import type { NotFoundMetaData } from '@/components/views/not-found-page-view'
import { notFound, type NotFoundError } from '@tanstack/react-router'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { jwtDecode } from 'jwt-decode'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function replaceUrl(url: string) {
  window.history.replaceState(null, '', url)
}

export function bytesToMegabytes(bytes: number, decimalPlaces = 2) {
  if (bytes === 0) {
    return 0
  }
  const megabytes = bytes / (1024 * 1024)
  return megabytes.toFixed(decimalPlaces)
}

export function mbToBytesBinary(megabytes: number) {
  return megabytes * 1024 * 1024
}

/**
 * Convert an object into FormData dynamically.
 * Skips undefined/null fields.
 * Supports File / Blob types.
 */
export function objectToFormData(data: Record<string, any>): FormData {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // handle arrays (e.g. tags: ["a", "b"])
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(`${key}[]`, v))
      } else {
        formData.append(key, value)
      }
    }
  })

  return formData
}

export function notFoundWithMetadata(
  options: Omit<NotFoundError, 'data'> & { data: NotFoundMetaData },
) {
  return notFound(options)
}

export function parseJwt(token: string) {
  return jwtDecode(token)
}

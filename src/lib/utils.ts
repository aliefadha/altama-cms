import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { API_BASE_URL } from './api-client'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(imagePath: string): string {
  if (!imagePath) return ''
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

export function isImageUsedInContent(
  imageUrl: string,
  content: string,
): boolean {
  if (!imageUrl || !content) return false

  const normalizedUrl = imageUrl.replace(/^\/+/, '')

  return content.includes(imageUrl) || content.includes(normalizedUrl)
}

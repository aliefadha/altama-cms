import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'
import { API_BASE_URL } from './api-client'

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

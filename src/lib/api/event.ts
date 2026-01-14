import { apiClient } from '../api-client'

export interface Event {
  id: string
  title: string
  image: string
}

export async function getEvents() {
  const response = await apiClient.get<Array<Event>>('/event')
  return response.data
}

export async function getEventById(id: string) {
  const response = await apiClient.get<Event>(`/event/${id}`)
  return response.data
}

export async function deleteEvent(id: string) {
  const response = await apiClient.delete<void>(`/event/${id}`)
  return response.data
}

export interface UpdateEventInput {
  id: string
  title: string
  file?: File
}

export async function updateEvent(input: UpdateEventInput) {
  const formData = new FormData()
  formData.append('title', input.title)
  if (input.file) {
    formData.append('file', input.file)
  }

  const response = await apiClient.patch<Event>(`/event/${input.id}`, formData)
  return response.data
}

export interface CreateEventInput {
  title: string
  file: File
}

export async function createEvent(input: CreateEventInput) {
  const formData = new FormData()
  formData.append('title', input.title)
  formData.append('file', input.file)

  const response = await apiClient.post<Event>('/event', formData)
  return response.data
}

export const eventApi = {
  getEvents,
  getEventById,
  deleteEvent,
  updateEvent,
  createEvent,
}

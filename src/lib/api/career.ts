import { apiClient } from '../api-client'

export interface Career {
  id: string
  title: string
  overview: string
  link: string
}

export async function getCareers() {
  const response = await apiClient.get<Array<Career>>('/career')
  return response.data
}

export async function getCareerById(id: string) {
  const response = await apiClient.get<Career>(`/career/${id}`)
  return response.data
}

export async function deleteCareer(id: string) {
  const response = await apiClient.delete<void>(`/career/${id}`)
  return response.data
}

export interface UpdateCareerInput {
  id: string
  title: string
  overview: string
  link: string
}

export async function updateCareer(input: UpdateCareerInput) {
  const response = await apiClient.patch<Career>(`/career/${input.id}`, input)
  return response.data
}

export interface CreateCareerInput {
  title: string
  overview: string
  link: string
}

export async function createCareer(input: CreateCareerInput) {
  const response = await apiClient.post<Career>('/career', input)
  return response.data
}

export const careerApi = {
  getCareers,
  getCareerById,
  deleteCareer,
  updateCareer,
  createCareer,
}

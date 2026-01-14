import { apiClient } from '../api-client'

export interface CategoryArticle {
  id: string
  name: string
}

export async function getCategoryArticles() {
  const response =
    await apiClient.get<Array<CategoryArticle>>('/category-article')
  return response.data
}

export async function getCategoryArticleById(id: string) {
  const response = await apiClient.get<CategoryArticle>(
    `/category-article/${id}`,
  )
  return response.data
}

export interface CreateCategoryArticleInput {
  name: string
}

export async function createCategoryArticle(input: CreateCategoryArticleInput) {
  const response = await apiClient.post<CategoryArticle>('/category-article', {
    name: input.name,
  })
  return response.data
}

export interface UpdateCategoryArticleInput {
  id: string
  name: string
}

export async function updateCategoryArticle(input: UpdateCategoryArticleInput) {
  const response = await apiClient.patch<CategoryArticle>(
    `/category-article/${input.id}`,
    {
      name: input.name,
    },
  )
  return response.data
}

export async function deleteCategoryArticle(id: string) {
  const response = await apiClient.delete<void>(`/category-article/${id}`)
  return response.data
}

export const categoryArticleApi = {
  getCategoryArticles,
  getCategoryArticleById,
  createCategoryArticle,
  updateCategoryArticle,
  deleteCategoryArticle,
}

import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { categoryArticleApi } from '@/lib/api/category-article'

export const Route = createFileRoute(
  '/_authenticated/category-article/$id' as any,
)({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = Route.useParams()
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const {
    data: category,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['category-article', id],
    queryFn: () => categoryArticleApi.getCategoryArticleById(id),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: categoryArticleApi.updateCategoryArticle,
    onSuccess: () => {
      toast.success('Category article updated successfully')
      queryClient.invalidateQueries({ queryKey: ['category-article', id] })
      queryClient.invalidateQueries({ queryKey: ['category-articles'] })
      setViewMode('view')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update category article',
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: categoryArticleApi.deleteCategoryArticle,
    onSuccess: () => {
      toast.success('Category article deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['category-article', id] })
      queryClient.invalidateQueries({ queryKey: ['category-articles'] })
      setDeleteDialogOpen(false)
      router.navigate({ to: '/category-article' as any })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete category article',
      )
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="p-8 text-center text-destructive">
          Failed to load category article. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {viewMode === 'view'
                ? 'Category Article Details'
                : 'Edit Category Article'}
            </h1>
            <p className="text-muted-foreground">
              {viewMode === 'view'
                ? 'View category article information'
                : 'Edit category article content'}
            </p>
          </div>
          {viewMode === 'view' ? (
            <div className="flex gap-2">
              <Button onClick={() => setViewMode('edit')} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setViewMode('view')}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const form = document.getElementById(
                    'edit-form',
                  ) as HTMLFormElement
                  if (form)
                    form.dispatchEvent(
                      new Event('submit', { bubbles: true, cancelable: true }),
                    )
                }}
                size="sm"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{category.name}</CardTitle>
        </CardHeader>

        {viewMode === 'view' ? (
          <>
            <Separator />
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">ID</p>
                    <p className="font-mono text-sm">{category.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="text-sm">{category.name}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent>
            <form
              id="edit-form"
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget

                const nameInput = form.querySelector(
                  '[name="name"]',
                ) as HTMLInputElement

                if (!nameInput?.value) {
                  toast.error('Please enter a category name')
                  return
                }

                updateMutation.mutate({
                  id: category.id,
                  name: nameInput.value,
                })
              }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={category.name}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setViewMode('view')}
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category Article</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete category "{category?.name}"?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (category) deleteMutation.mutate(category.id)
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, FolderKanban, Pen, Plus, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { categoryArticleApi } from '@/lib/api/category-article'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/_authenticated/category-article/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['category-articles'],
    queryFn: categoryArticleApi.getCategoryArticles,
  })

  const deleteMutation = useMutation({
    mutationFn: categoryArticleApi.deleteCategoryArticle,
    onSuccess: () => {
      toast.success('Category article deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['category-articles'] })
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete category article',
      )
    },
  })

  const handleDeleteClick = (category: { id: string; name: string }) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" disabled>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Category Articles</h1>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="p-8 text-center text-destructive">
          Failed to load category articles. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Category Articles</h1>
        </div>
        <Link to="/category-article/create">
          <Button>
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Category</span>
          </Button>
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No category articles found. Create your first category to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() =>
                navigate({
                  to: '/category-article/$id',
                  params: { id: category.id },
                } as unknown as any)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FolderKanban className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-lg truncate">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        ID: {category.id}
                      </CardDescription>
                    </CardHeader>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                  <Link
                    to="/category-article/$id"
                    params={{ id: category.id }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Pen className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(category)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete category "{categoryToDelete?.name}
              "? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setCategoryToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

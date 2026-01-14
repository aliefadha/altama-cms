import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { categoryArticleApi } from '@/lib/api/category-article'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/_authenticated/category-article/create')(
  {
    component: CreateCategoryArticlePage,
  },
)

function CreateCategoryArticlePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')

  const createMutation = useMutation({
    mutationFn: categoryArticleApi.createCategoryArticle,
    onSuccess: () => {
      toast.success('Category article created successfully')
      navigate({ to: '/category-article' as any })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create category article',
      )
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter a category name')
      return
    }
    createMutation.mutate({ name: name.trim() })
  }

  const handleCancel = () => {
    navigate({ to: '/category-article' as any })
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Category Article
          </h1>
          <p className="text-muted-foreground">
            Fill in the details below to create a new category article.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Category Details
          </CardTitle>
          <CardDescription>
            Enter the category information. All fields marked with * are
            required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                required
                disabled={createMutation.isPending}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

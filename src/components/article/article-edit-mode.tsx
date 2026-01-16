import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Skeleton } from '@/components/ui/skeleton'
import { categoryArticleApi } from '@/lib/api/category-article'
import { getImageUrl } from '@/lib/utils'

interface ArticleEditModeProps {
  article: {
    id: string
    title: string
    primaryImage: string | null
    excerpt: string
    contentHtml: string | undefined
    category?: {
      id: string
      name: string
    } | null
  }
  onCancel: () => void
  isPending: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function ArticleEditMode({
  article,
  onCancel,
  isPending,
  onSubmit,
}: ArticleEditModeProps) {
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['category-articles'],
    queryFn: categoryArticleApi.getCategoryArticles,
  })

  return (
    <form id="edit-form" onSubmit={onSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Title *</Label>
          <Input
            id="edit-title"
            name="title"
            defaultValue={article.title}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-categoryId">Category *</Label>
          {isCategoriesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={article.category?.id ?? undefined}
              onValueChange={(value) => {
                const categoryInput = document.querySelector(
                  '[name="categoryId"]',
                ) as HTMLInputElement
                if (categoryInput) {
                  categoryInput.value = value
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem value={category.id} key={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <input
            type="hidden"
            name="categoryId"
            value={article.category?.id ?? ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-file">Primary Image</Label>
          <Input id="edit-file" name="file" type="file" accept="image/*" />
          {article.primaryImage && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">
                Current Image:
              </p>
              <img
                src={getImageUrl(article.primaryImage)}
                alt={article.title}
                className="rounded-lg max-w-lg max-h-64 object-cover border"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-excerpt">Excerpt *</Label>
          <textarea
            id="edit-excerpt"
            name="excerpt"
            defaultValue={article.excerpt}
            rows={3}
            required
            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-content">Content *</Label>
          <input
            type="hidden"
            name="content"
            value={article.contentHtml ?? ''}
          />
          <RichTextEditor
            content={article.contentHtml}
            onChange={(html) => {
              const contentInput = document.querySelector(
                '[name="content"]',
              ) as HTMLInputElement
              if (contentInput) {
                contentInput.value = html
              }
            }}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  )
}

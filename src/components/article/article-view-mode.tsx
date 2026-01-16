import { FileText } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import { ArticleContent } from './article-content'

interface ArticleViewModeProps {
  article: {
    id: string
    slug: string
    title: string
    primaryImage: string | null
    excerpt: string
    contentHtml: string | null
    publishedAt: string | null
    categoryId: string | null
    category?: {
      id: string
      name: string
    } | null
  }
}

export function ArticleViewMode({ article }: ArticleViewModeProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">ID</p>
          <p className="font-mono text-sm">{article.id}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Slug</p>
          <p className="font-mono text-sm">{article.slug}</p>
        </div>
      </div>

      {article.category && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Category</p>
          <p className="text-sm">{article.category.name}</p>
        </div>
      )}

      <div>
        <p className="text-sm text-muted-foreground mb-1">Excerpt</p>
        <p className="text-sm">{article.excerpt}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-1">Primary Image</p>
        {article.primaryImage ? (
          <img
            src={getImageUrl(article.primaryImage)}
            alt={article.title}
            className="rounded-lg max-w-lg object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <ArticleContent contentHtml={article.contentHtml} />
    </div>
  )
}

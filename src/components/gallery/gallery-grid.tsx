import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ImageCard } from './image-card'
import { CreateImageDialog } from './create-image-dialog'
import { ImagePreviewDialog } from './image-preview-dialog'
import type { GalleryImage } from '@/lib/api/gallery'
import { galleryApi } from '@/lib/api/gallery'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const IMAGE_GRID_CLASSES =
  'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'

interface GalleryGridProps {
  className?: string
}

export function GalleryGrid({ className }: GalleryGridProps) {
  const queryClient = useQueryClient()
  const [isWebDialogOpen, setIsWebDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  const {
    data: webImages = [],
    isLoading: webLoading,
    error: webError,
  } = useQuery({
    queryKey: ['gallery', 'web'],
    queryFn: galleryApi.getWebGallery,
  })

  const deleteWebMutation = useMutation({
    mutationFn: galleryApi.deleteWebImage,
    onSuccess: () => {
      toast.success('Image deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['gallery', 'web'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete image',
      )
    },
  })

  function renderGrid(
    images: Array<GalleryImage>,
    isLoading: boolean,
    error?: unknown,
    onDelete?: (id: string) => void,
  ) {
    if (error) {
      return (
        <div className="p-8 text-center text-destructive">
          Failed to load images. Please try again.
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className={IMAGE_GRID_CLASSES}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      )
    }

    if (images.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          No images found.
        </div>
      )
    }

    return (
      <div className={IMAGE_GRID_CLASSES}>
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => setSelectedImage(image)}
            onDelete={onDelete ? () => onDelete(image.id) : () => {}}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold tracking-tight">Web Gallery</h2>
        <Button size="sm" className="gap-2" onClick={() => setIsWebDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Image
        </Button>
      </div>

      {renderGrid(
        webImages,
        webLoading,
        webError,
        deleteWebMutation.mutate,
      )}

      <CreateImageDialog
        open={isWebDialogOpen}
        onOpenChange={setIsWebDialogOpen}
      />
      <ImagePreviewDialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        image={selectedImage}
      />
    </div>
  )
}

import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
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
import { eventApi } from '@/lib/api/event'
import { getImageUrl } from '@/lib/api-client'

export const Route = createFileRoute('/_authenticated/event/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = Route.useParams()
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventApi.getEventById(id),
    enabled: !!id,
  })

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      if (event.image) {
        setImagePreview(getImageUrl(event.image))
      }
    }
  }, [event])

  const updateMutation = useMutation({
    mutationFn: eventApi.updateEvent,
    onSuccess: () => {
      toast.success('Event updated successfully')
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setViewMode('view')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update event',
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: eventApi.deleteEvent,
    onSuccess: () => {
      toast.success('Event deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setDeleteDialogOpen(false)
      router.navigate({ to: '/event' })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete event',
      )
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

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
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="p-8 text-center text-destructive">
          Failed to load event. Please try again.
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
              {viewMode === 'view' ? 'Event Details' : 'Edit Event'}
            </h1>
            <p className="text-muted-foreground">
              {viewMode === 'view'
                ? 'View event information'
                : 'Edit event content'}
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
                onClick={() => {
                  setViewMode('view')
                  setTitle(event.title)
                  setImagePreview(getImageUrl(event.image))
                  setFile(null)
                }}
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
          <CardTitle className="text-3xl">{event.title}</CardTitle>
        </CardHeader>

        {viewMode === 'view' ? (
          <>
            <Separator />
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Event Image</h3>
                <img
                  src={getImageUrl(event.image)}
                  alt={event.title}
                  className="w-full h-auto rounded"
                />
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent>
            <form
              id="edit-form"
              onSubmit={(e) => {
                e.preventDefault()

                if (!title) {
                  toast.error('Title is required')
                  return
                }

                updateMutation.mutate({
                  id: event.id,
                  title,
                  file: file || undefined,
                })
              }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-file">Image</Label>
                  <Input
                    id="edit-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to keep the current image
                  </p>
                </div>

                {imagePreview && (
                  <div className="space-y-2">
                    <Label>Image Preview</Label>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md h-auto rounded border"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setViewMode('view')
                      setTitle(event.title)
                      setImagePreview(getImageUrl(event.image))
                      setFile(null)
                    }}
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
              <DialogTitle>Delete Event</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete event "{event?.title}"? This
                action cannot be undone.
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
                  if (event) deleteMutation.mutate(event.id)
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

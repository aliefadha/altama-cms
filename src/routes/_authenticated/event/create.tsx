import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { eventApi } from '@/lib/api/event'

export const Route = createFileRoute('/_authenticated/event/create')({
  component: EventCreatePage,
})

function EventCreatePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: eventApi.createEvent,
    onSuccess: (data) => {
      toast.success('Event created successfully')
      queryClient.invalidateQueries({ queryKey: ['events'] })
      router.navigate({ to: '/event/$id', params: { id: data.id } })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create event',
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!title || !file) {
      toast.error('Please fill in all required fields')
      return
    }

    createMutation.mutate({
      title,
      file,
    })
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
        <h1 className="text-2xl font-bold tracking-tight">Create Event</h1>
        <p className="text-muted-foreground">Create a new event</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Company Annual Meeting 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Image *</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: JPG, PNG, WEBP
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
                onClick={() => router.history.back()}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Save, Trash2, Link as LinkIcon } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { careerApi } from '@/lib/api/career'

export const Route = createFileRoute('/_authenticated/career/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = Route.useParams()
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const {
    data: career,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['career', id],
    queryFn: () => careerApi.getCareerById(id),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: careerApi.updateCareer,
    onSuccess: () => {
      toast.success('Career updated successfully')
      queryClient.invalidateQueries({ queryKey: ['career', id] })
      queryClient.invalidateQueries({ queryKey: ['careers'] })
      setViewMode('view')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update career',
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: careerApi.deleteCareer,
    onSuccess: () => {
      toast.success('Career deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['career', id] })
      queryClient.invalidateQueries({ queryKey: ['careers'] })
      setDeleteDialogOpen(false)
      router.navigate({ to: '/career' })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete career',
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

  if (error || !career) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="p-8 text-center text-destructive">
          Failed to load career. Please try again.
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
              {viewMode === 'view' ? 'Career Details' : 'Edit Career'}
            </h1>
            <p className="text-muted-foreground">
              {viewMode === 'view'
                ? 'View career information'
                : 'Edit career content'}
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
          <CardTitle className="text-3xl">{career.title}</CardTitle>
          {career.link && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <LinkIcon className="h-4 w-4" />
              <a
                href={career.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {career.link}
              </a>
            </div>
          )}
        </CardHeader>

        {viewMode === 'view' ? (
          <>
            <Separator />
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Overview</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {career.overview}
                </p>
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

                const titleInput = form.querySelector(
                  '[name="title"]',
                ) as HTMLInputElement
                const overviewInput = form.querySelector(
                  '[name="overview"]',
                ) as HTMLInputElement
                const linkInput = form.querySelector(
                  '[name="link"]',
                ) as HTMLInputElement

                if (
                  !titleInput?.value ||
                  !overviewInput?.value ||
                  !linkInput?.value
                ) {
                  toast.error('Please fill in all required fields')
                  return
                }

                updateMutation.mutate({
                  id: career.id,
                  title: titleInput.value,
                  overview: overviewInput.value,
                  link: linkInput.value,
                })
              }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={career.title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-link">Link *</Label>
                  <Input
                    id="edit-link"
                    name="link"
                    defaultValue={career.link}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-overview">Overview *</Label>
                  <textarea
                    id="edit-overview"
                    name="overview"
                    defaultValue={career.overview}
                    rows={6}
                    required
                    className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <DialogTitle>Delete Career</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete career "{career?.title}"? This
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
                  if (career) deleteMutation.mutate(career.id)
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

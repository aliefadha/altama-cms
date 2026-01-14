import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Pen, Trash2, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { eventApi } from '@/lib/api/event'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/api-client'

export const Route = createFileRoute('/_authenticated/event/')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['events'],
    queryFn: eventApi.getEvents,
  })

  const deleteMutation = useMutation({
    mutationFn: eventApi.deleteEvent,
    onSuccess: () => {
      toast.success('Event deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete event',
      )
    },
  })

  const handleDelete = (id: string) => {
    setEventToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Events</h1>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="p-8 text-center text-destructive">
          Failed to load events. Please try again.
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
          <h1 className="text-2xl font-bold">Events</h1>
        </div>
        <Link to="/event/create">
          <Button>
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Event</span>
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No events found. Create your first event to get started.
        </div>
      ) : (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <Link
                    to="/event/$id"
                    params={{ id: event.id }}
                    className="hover:underline font-medium"
                  >
                    {event.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <img
                    src={getImageUrl(event.image)}
                    alt={event.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.navigate({
                          to: '/event/$id',
                          params: { id: event.id },
                        })
                      }
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

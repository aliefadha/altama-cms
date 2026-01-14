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
import { careerApi } from '@/lib/api/career'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/career/')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [careerToDelete, setCareerToDelete] = useState<string | null>(null)

  const {
    data: careers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['careers'],
    queryFn: careerApi.getCareers,
  })

  const deleteMutation = useMutation({
    mutationFn: careerApi.deleteCareer,
    onSuccess: () => {
      toast.success('Career deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['careers'] })
      setDeleteDialogOpen(false)
      setCareerToDelete(null)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete career',
      )
    },
  })

  const handleDelete = (id: string) => {
    setCareerToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (careerToDelete) {
      deleteMutation.mutate(careerToDelete)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Careers</h1>
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
          Failed to load careers. Please try again.
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
          <h1 className="text-2xl font-bold">Careers</h1>
        </div>
        <Link to="/career/create">
          <Button>
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Career</span>
          </Button>
        </Link>
      </div>

      {careers.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No careers found. Create your first career to get started.
        </div>
      ) : (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {careers.map((career) => (
              <TableRow key={career.id}>
                <TableCell>
                  <Link
                    to="/career/$id"
                    params={{ id: career.id }}
                    className="hover:underline font-medium"
                  >
                    {career.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <a
                    href={career.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:underline"
                  >
                    {career.link}
                  </a>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.navigate({
                          to: '/career/$id',
                          params: { id: career.id },
                        })
                      }
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(career.id)}
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
            <AlertDialogTitle>Delete Career</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this career? This action cannot be
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

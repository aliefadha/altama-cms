import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { careerApi } from '@/lib/api/career'

export const Route = createFileRoute('/_authenticated/career/create')({
  component: CareerCreatePage,
})

function CareerCreatePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: careerApi.createCareer,
    onSuccess: (data) => {
      toast.success('Career created successfully')
      queryClient.invalidateQueries({ queryKey: ['careers'] })
      router.navigate({ to: '/career/$id', params: { id: data.id } })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create career',
      )
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget

    const titleInput = form.querySelector('[name="title"]') as HTMLInputElement
    const overviewInput = form.querySelector(
      '[name="overview"]',
    ) as HTMLInputElement
    const linkInput = form.querySelector('[name="link"]') as HTMLInputElement

    if (!titleInput?.value || !overviewInput?.value || !linkInput?.value) {
      toast.error('Please fill in all required fields')
      return
    }

    createMutation.mutate({
      title: titleInput.value,
      overview: overviewInput.value,
      link: linkInput.value,
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
        <h1 className="text-2xl font-bold tracking-tight">Create Career</h1>
        <p className="text-muted-foreground">Create a new career opportunity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Career Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link *</Label>
              <Input
                id="link"
                name="link"
                placeholder="e.g. https://example.com/careers/apply"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overview">Overview *</Label>
              <textarea
                id="overview"
                name="overview"
                placeholder="Provide a brief overview of this career opportunity"
                rows={6}
                required
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

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
                {createMutation.isPending ? 'Creating...' : 'Create Career'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Briefcase,
  // Calendar,
  Image,
  Newspaper,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { articleApi } from '@/lib/api/article'
import { careerApi } from '@/lib/api/career'
// import { eventApi } from '@/lib/api/event'
import { galleryApi } from '@/lib/api/gallery'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: RouteComponent,
})

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  href: string
  label: string
  isLoading: boolean
  colorClass: string
}

function StatCard({
  title,
  value,
  icon,
  href,
  label,
  isLoading,
  colorClass,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClass}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
        <Link to={href}>
          <Button variant="link" className="h-auto p-0 text-muted-foreground">
            {label}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function RouteComponent() {
  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: articleApi.getArticles,
  })

  const { data: careers = [], isLoading: careersLoading } = useQuery({
    queryKey: ['careers'],
    queryFn: careerApi.getCareers,
  })

  // const { data: events = [], isLoading: eventsLoading } = useQuery({
  //   queryKey: ['events'],
  //   queryFn: eventApi.getEvents,
  // })

  const { data: instagramImages = [], isLoading: instagramLoading } = useQuery({
    queryKey: ['gallery', 'instagram'],
    queryFn: galleryApi.getInstagramGallery,
  })

  const { data: webImages = [], isLoading: webLoading } = useQuery({
    queryKey: ['gallery', 'web'],
    queryFn: galleryApi.getWebGallery,
  })

  const totalGalleryImages =
    (instagramImages?.length ?? 0) + (webImages?.length ?? 0)


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Articles"
          value={articles.length}
          icon={<Newspaper className="h-4 w-4 text-white" />}
          href="/article"
          label="View all articles"
          isLoading={articlesLoading}
          colorClass="bg-[#353185]"
        />
        <StatCard
          title="Careers"
          value={careers.length}
          icon={<Briefcase className="h-4 w-4 text-white" />}
          href="/career"
          label="View all careers"
          isLoading={careersLoading}
          colorClass="bg-emerald-600"
        />
        {/* <StatCard
          title="Events"
          value={events.length}
          icon={<Calendar className="h-4 w-4 text-white" />}
          href="/event"
          label="View all events"
          isLoading={eventsLoading}
          colorClass="bg-amber-500"
        /> */}
        <StatCard
          title="Gallery Images"
          value={totalGalleryImages}
          icon={<Image className="h-4 w-4 text-white" />}
          href="/gallery"
          label="View gallery"
          isLoading={instagramLoading || webLoading}
          colorClass="bg-pink-500"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/article/create">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-auto py-4"
              >
                <Plus className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">New Article</div>
                </div>
              </Button>
            </Link>
            <Link to="/career/create">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-auto py-4"
              >
                <Plus className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">New Career</div>
                </div>
              </Button>
            </Link>
            {/* <Link to="/event/create">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-auto py-4"
              >
                <Plus className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">New Event</div>
                </div>
              </Button>
            </Link> */}
            <Link to="/gallery">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-auto py-4"
              >
                <Image className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Add Image</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

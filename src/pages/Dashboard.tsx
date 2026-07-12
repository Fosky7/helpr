import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PencilIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardCampaign {
  id: string
  title: string | null
  status: string | null
  goal_amount: number | null
  updated_at: string | null
}

const Dashboard = () => {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<DashboardCampaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadCampaigns(user.id)
    }
  }, [user])

  const loadCampaigns = async (userId: string) => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, title, status, goal_amount, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setCampaigns(data as DashboardCampaign[])
    } else {
      console.error('Error loading dashboard campaigns:', error)
    }
    setLoading(false)
  }

  const recentCampaigns = campaigns.slice(0, 3)

  return (
    <AppShell maxWidthClassName="max-w-6xl" contentClassName="space-y-8">
      {/* User greeting and edit profile section */}
      <div className="flex flex-col gap-6 rounded-3xl border border-primary/20 bg-card/85 p-6 shadow-xl shadow-primary/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <span className="text-xl font-bold">
              {(user?.email?.charAt(0) || 'R').toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, <span className="text-primary">{user?.email?.split('@')[0] || 'Creator'}</span>!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your campaigns and profile from your colorful dashboard.
            </p>
          </div>
        </div>
        <Button asChild className="group rounded-xl shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
          <Link to="/profile" className="flex items-center gap-2">
            <PencilIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Quick stats or campaign summary cards */}
      <section aria-labelledby="campaigns-heading" className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Your campaigns</p>
            <h2 id="campaigns-heading" className="mt-2 text-3xl font-bold tracking-tight">
              Recent fundraisers
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-xl bg-background/70">
            <Link to="/campaigns">View all campaigns</Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-primary/20 bg-card/90">
                <CardHeader className="p-5">
                  <Skeleton className="h-6 w-32 rounded-xl" />
                  <Skeleton className="mt-2 h-4 w-48 rounded-xl" />
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <Skeleton className="h-20 rounded-xl" />
                </CardContent>
                <CardFooter className="p-5">
                  <Skeleton className="h-10 w-full rounded-xl" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : recentCampaigns.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {recentCampaigns.map((campaign) => (
              <Card key={campaign.id} className="group border-primary/20 bg-card/90 shadow-md transition-all hover:shadow-xl hover:shadow-primary/10">
                <CardHeader className="p-5">
                  <CardTitle className="text-lg">{campaign.title || 'Untitled campaign'}</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wide">{campaign.status || 'draft'}</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 text-sm">
                  <p>
                    Goal: {campaign.goal_amount ? `$${campaign.goal_amount}` : 'Not set'}
                  </p>
                </CardContent>
                <CardFooter className="p-5">
                  <Button asChild variant="outline" size="sm" className="w-full rounded-xl group-hover:bg-primary/10">
                    <Link to={`/campaigns/${campaign.id}`}>View details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-primary/30 bg-card/80 p-8 text-center">
            <CardContent className="space-y-4">
              <BrandMark compact size="lg" className="mx-auto" />
              <h3 className="text-xl font-semibold">No campaigns yet</h3>
              <p className="text-sm text-muted-foreground">
                Start your first colorful fundraiser and it will appear here.
              </p>
              <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
                <Link to="/campaigns/new">Create a campaign</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </AppShell>
  )
}

export default Dashboard
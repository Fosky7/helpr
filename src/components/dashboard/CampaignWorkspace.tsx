import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import CampaignCard from '@/components/campaigns/CampaignCard'
import type { ManagedCampaign } from '@/components/campaigns/CampaignCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export default function CampaignWorkspace() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<ManagedCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const fetchCampaigns = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const { data, error: queryError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (!active) return

        if (queryError) {
          throw queryError
        }

        setCampaigns(data as ManagedCampaign[])
      } catch (err: unknown) {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Failed to load campaigns'
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchCampaigns()

    return () => {
      active = false
    }
  }, [user?.id])

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
        <div className="flex items-center justify-center p-8">
          <Spinner className="h-8 w-8 text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Loading campaigns...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/40 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardContent className="p-6 text-center text-sm text-destructive">
          <p>Failed to load campaigns.</p>
          <p className="text-xs text-muted-foreground mt-2">{error}</p>
          <Button variant="outline" className="mt-4 rounded-xl bg-background/70" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (campaigns.length === 0) {
    return (
      <Card className="border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <p className="text-lg font-bold tracking-tight">No campaigns yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Create your first campaign to start fundraising.</p>
          <Button asChild className="mt-6 rounded-xl shadow-lg shadow-primary/20">
            <Link to="/campaigns/new">Create campaign</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((campaign) => (
        <Link
          key={campaign.id}
          to={`/campaigns/${campaign.id}`}
          className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <CampaignCard campaign={campaign} />
        </Link>
      ))}
    </div>
  )
}
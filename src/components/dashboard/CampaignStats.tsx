import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface Stats {
  totalCampaigns: number
  totalGoalAmount: number
  publishedCount: number
}

export default function CampaignStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const fetchStats = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const { data, error: queryError } = await supabase
          .from('campaigns')
          .select('id, goal_amount, status')
          .eq('user_id', user.id)

        if (ignore) return

        if (queryError) {
          throw queryError
        }

        const campaigns = data || []
        const totalCampaigns = campaigns.length
        const publishedCount = campaigns.filter((c) => c.status === 'published').length
        const totalGoalAmount = campaigns.reduce((sum, c) => sum + (c.goal_amount || 0), 0)

        setStats({ totalCampaigns, totalGoalAmount, publishedCount })
      } catch (err: unknown) {
        if (ignore) return
        const message = err instanceof Error ? err.message : 'Failed to load stats'
        setError(message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchStats()

    return () => {
      ignore = true
    }
  }, [user?.id])

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
        <div className="flex items-center justify-center p-8">
          <Spinner className="h-8 w-8 text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Loading stats...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/40 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
        <div className="p-6 text-center text-sm text-destructive">
          <p>Failed to load campaign stats.</p>
          <p className="text-xs text-muted-foreground mt-2">{error}</p>
        </div>
      </Card>
    )
  }

  if (!stats) return null

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="border-primary/20 bg-card/90 p-5 shadow-xl shadow-primary/10 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Campaigns</p>
        <p className="mt-3 text-3xl font-black text-primary">{stats.totalCampaigns}</p>
        <p className="mt-2 text-sm text-muted-foreground">All campaigns you've created</p>
      </Card>
      <Card className="border-primary/20 bg-card/90 p-5 shadow-xl shadow-primary/10 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Goal Amount</p>
        <p className="mt-3 text-3xl font-black text-primary">{formatCurrency(stats.totalGoalAmount)}</p>
        <p className="mt-2 text-sm text-muted-foreground">Cumulative fundraising goals</p>
      </Card>
      <Card className="border-primary/20 bg-card/90 p-5 shadow-xl shadow-primary/10 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Published</p>
        <p className="mt-3 text-3xl font-black text-primary">{stats.publishedCount}</p>
        <p className="mt-2 text-sm text-muted-foreground">Campaigns live to the public</p>
      </Card>
    </div>
  )
}
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import BackNavigation from '@/components/navigation/BackNavigation'
import ColorfulSectionHeader from '@/components/layout/ColorfulSectionHeader'
import PublicCampaignCard, { type PublicCampaignCardData } from '@/components/campaigns/PublicCampaignCard'
import CampaignStateCard from '@/components/campaigns/CampaignStateCard'
import { Button } from '@/components/ui/button'

export interface PublicCampaignRecord extends PublicCampaignCardData {
  status?: string | null
}

export default function PublicCampaigns() {
  const location = useLocation()
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<PublicCampaignRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentRouteState = useMemo(() => ({ from: location.pathname }), [location.pathname])

  const loadCampaigns = async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message || 'Unable to load public fundraisers right now.')
      setCampaigns([])
    } else {
      setCampaigns(((data ?? []) as PublicCampaignRecord[]).filter((campaign) => Boolean(campaign.slug)))
    }

    setLoading(false)
  }

  useEffect(() => {
    let active = true

    const run = async () => {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (!active) return

      if (fetchError) {
        setError(fetchError.message || 'Unable to load public fundraisers right now.')
        setCampaigns([])
      } else {
        setCampaigns(((data ?? []) as PublicCampaignRecord[]).filter((campaign) => Boolean(campaign.slug)))
      }

      setLoading(false)
    }

    run()

    return () => {
      active = false
    }
  }, [])

  const featuredCampaign = campaigns[0]
  const remainingCampaigns = campaigns.slice(1)

  const isAuthenticated = Boolean(user?.id)

  return (
    <AppShell maxWidthClassName="max-w-7xl" contentClassName="space-y-8" aria-label="Public Renderr fundraisers">
      <header className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-card/85 p-5 shadow-xl shadow-primary/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="min-h-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <BrandMark subtitle="Public fundraisers" />
        </Link>

        <nav className="flex flex-col gap-2 sm:flex-row sm:items-center" aria-label="Fundraiser navigation">
          <BackNavigation fallbackTo="/" />
          <Button asChild variant="outline" className="min-h-10 rounded-xl bg-background/70">
            <Link to="/">Home</Link>
          </Button>
          {isAuthenticated ? (
            <>
              <Button asChild variant="outline" className="min-h-10 rounded-xl bg-background/70">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild className="min-h-10 rounded-xl shadow-lg shadow-primary/20">
                <Link to="/campaigns/new">Create Campaign</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="min-h-10 rounded-xl bg-background/70">
                <Link to="/auth?mode=login">Log in</Link>
              </Button>
              <Button asChild className="min-h-10 rounded-xl shadow-lg shadow-primary/20">
                <Link to="/auth?mode=signup">Start a fundraiser</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <ColorfulSectionHeader
        headingLevel={1}
        eyebrow="Live community campaigns"
        title="Find a fundraiser to support today."
        description="Browse published Renderr fundraisers with colorful campaign cards, clear progress indicators, and direct paths to learn more about each mission."
        actions={
          isAuthenticated ? (
            <Button asChild className="min-h-10 rounded-xl shadow-lg shadow-primary/20">
              <Link to="/campaigns/new">Create a campaign</Link>
            </Button>
          ) : (
            <Button asChild className="min-h-10 rounded-xl shadow-lg shadow-primary/20">
              <Link to="/auth?mode=signup">Create your fundraiser</Link>
            </Button>
          )
        }
      />

      {loading ? (
        <CampaignStateCard variant="loading" title="Loading fundraisers" description="We are gathering the latest public Renderr campaigns." />
      ) : error ? (
        <CampaignStateCard variant="error" title="Fundraisers could not load" description={error} onRetry={loadCampaigns} />
      ) : campaigns.length === 0 ? (
        <CampaignStateCard
          variant="empty"
          title="No public fundraisers yet"
          description="Published campaigns will appear here as creators launch them. You can be the first to start a colorful Renderr fundraiser."
          actionLabel={isAuthenticated ? 'Create a campaign' : 'Start a fundraiser'}
          actionTo={isAuthenticated ? '/campaigns/new' : '/auth?mode=signup'}
        />
      ) : (
        <section className="space-y-6" aria-labelledby="public-campaigns-title">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Campaign gallery</p>
              <h2 id="public-campaigns-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Support a bright idea</h2>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {campaigns.length} {campaigns.length === 1 ? 'fundraiser' : 'fundraisers'} published
            </p>
          </div>

          {featuredCampaign ? <PublicCampaignCard campaign={featuredCampaign} featured linkState={currentRouteState} /> : null}

          {remainingCampaigns.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {remainingCampaigns.map((campaign, index) => (
                <PublicCampaignCard key={String(campaign.id ?? campaign.slug ?? index)} campaign={campaign} linkState={currentRouteState} />
              ))}
            </div>
          ) : null}
        </section>
      )}
    </AppShell>
  )
}

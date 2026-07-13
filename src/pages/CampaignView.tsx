import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import BackNavigation from '@/components/navigation/BackNavigation'
import CampaignStatusBadge from '@/components/campaigns/CampaignStatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cardPrimary, cardInner } from '@/lib/styles'

type RouteParams = {
  id?: string
  campaignId?: string
  slug?: string
}

type CampaignDetail = {
  id: string
  user_id?: string | null
  title?: string | null
  slug?: string | null
  summary?: string | null
  description?: string | null
  goal_amount?: number | null
  cover_image_url?: string | null
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
  published_at?: string | null
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value ?? NaN) ? Number(value) : 0)
}

function formatDate(value?: string | null) {
  if (!value) return 'Not available'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getCampaignStatus(campaign: CampaignDetail): 'draft' | 'published' | 'archived' {
  if (campaign.status === 'published' || campaign.status === 'archived') return campaign.status
  return 'draft'
}

export default function CampaignView() {
  const { id, campaignId, slug } = useParams<RouteParams>()
  const location = useLocation()
  const { user } = useAuth()
  const mountedRef = useRef(true)
  const isPublicRoute = location.pathname.startsWith('/fundraisers') || location.pathname.startsWith('/campaigns/public')
  const resolvedCampaignId = id ?? campaignId ?? ''
  const resolvedSlug = slug ?? ''
  const fallbackTo = isPublicRoute ? '/fundraisers' : '/campaigns'

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const canManageCampaign = useMemo(() => {
    return Boolean(!isPublicRoute && user?.id && campaign?.user_id === user.id)
  }, [campaign?.user_id, isPublicRoute, user?.id])

  const loadCampaign = useCallback(async () => {
    setLoading(true)
    setError('')

    let query = supabase.from('campaigns').select('*')

    if (isPublicRoute) {
      if (!resolvedSlug) {
        setError('Campaign link is missing a slug.')
        setCampaign(null)
        setLoading(false)
        return
      }

      query = query.eq('slug', resolvedSlug).eq('status', 'published')
    } else {
      if (!resolvedCampaignId || !user?.id) {
        setError('Campaign link is unavailable.')
        setCampaign(null)
        setLoading(false)
        return
      }

      query = query.eq('id', resolvedCampaignId).eq('user_id', user.id)
    }

    const { data, error: loadError } = await query.maybeSingle()

    if (!mountedRef.current) return

    if (loadError) {
      setError(loadError.message || 'Campaign could not be loaded.')
      setCampaign(null)
    } else if (!data) {
      setError('Campaign not found.')
      setCampaign(null)
    } else {
      setCampaign(data as CampaignDetail)
    }

    setLoading(false)
  }, [isPublicRoute, resolvedCampaignId, resolvedSlug, user?.id])

  useEffect(() => {
    loadCampaign()
  }, [loadCampaign])

  const copyPublicLink = async () => {
    if (!campaign?.slug) return

    const url = `${window.location.origin}/fundraisers/${campaign.slug}`

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Public campaign link copied.')
    } catch {
      toast.error('Copy failed. You can still open the public page from the button below.')
    }
  }

  return (
    <AppShell maxWidthClassName="max-w-5xl" contentClassName="space-y-6" aria-label={isPublicRoute ? 'Public campaign detail' : 'Campaign detail'}>
      <nav className={`flex flex-col gap-4 ${cardPrimary} sm:flex-row sm:items-center sm:justify-between`} aria-label="Campaign detail navigation">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BackNavigation fallbackTo={fallbackTo} />
          <Link to={isPublicRoute ? '/fundraisers' : '/campaigns'} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <BrandMark subtitle={isPublicRoute ? 'Fundraiser' : 'Campaign detail'} />
          </Link>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="rounded-xl bg-background/70">
            <Link to={fallbackTo}>{isPublicRoute ? 'All fundraisers' : 'Campaigns'}</Link>
          </Button>
          {canManageCampaign ? (
            <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
              <Link to={`/campaigns/${campaign?.id}/edit`}>Edit campaign</Link>
            </Button>
          ) : null}
        </div>
      </nav>

      {loading ? (
        <Card aria-busy="true">
          <CardContent className="p-6 text-center text-sm text-muted-foreground sm:p-8">Loading campaign...</CardContent>
        </Card>
      ) : error || !campaign ? (
        <Card className="rounded-3xl border-destructive/40 bg-destructive/10 shadow-xl shadow-destructive/10 backdrop-blur">
          <CardContent className="space-y-4 p-6 sm:p-8">
            <p className="font-semibold text-destructive">Campaign could not be loaded.</p>
            <p className="text-sm leading-6 text-muted-foreground">{error || 'This campaign is unavailable.'}</p>
            <Button type="button" variant="outline" className="rounded-xl bg-background/70" onClick={loadCampaign}>Try again</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="relative overflow-hidden border-b border-primary/20 bg-gradient-to-br from-primary/15 via-accent/25 to-card p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl hidden sm:block" />
              <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-accent/50 blur-3xl hidden sm:block" />
            </div>

            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <CampaignStatusBadge status={getCampaignStatus(campaign)} />
                  {campaign.published_at ? <span className="text-sm font-medium text-muted-foreground">Published {formatDate(campaign.published_at)}</span> : null}
                </div>
                <CardTitle className="text-balance break-words text-4xl font-bold tracking-tight sm:text-5xl">{campaign.title || 'Untitled campaign'}</CardTitle>
                <CardDescription className="mt-4 max-w-2xl text-base leading-7 break-words">
                  {campaign.summary || 'This Renderr campaign is ready for a bright story.'}
                </CardDescription>
              </div>

              <div className="rounded-3xl border border-primary/20 bg-background/75 p-5 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fundraising goal</p>
                <p className="mt-3 text-4xl font-black text-primary">{formatCurrency(campaign.goal_amount)}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Last updated {formatDate(campaign.updated_at)}</p>
              </div>
            </div>
          </CardHeader>

          {campaign.cover_image_url ? (
            <div className="border-b border-primary/20 bg-muted/20 p-4 sm:p-6">
              <img src={campaign.cover_image_url} alt="" className="w-full h-auto max-h-48 sm:max-h-72 rounded-3xl border border-primary/15 object-cover shadow-lg shadow-primary/10" />
            </div>
          ) : null}

          <CardContent className="space-y-6 p-6 sm:p-8">
            <section className={cardInner} aria-labelledby="campaign-story-title">
              <h2 id="campaign-story-title" className="text-2xl font-bold tracking-tight">Campaign story</h2>
              <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">
                {campaign.description || 'The creator has not added a full campaign story yet.'}
              </p>
            </section>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-primary/20 bg-muted/20 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <Button asChild variant="outline" className="w-full rounded-xl bg-background/70 sm:w-auto">
              <Link to={fallbackTo}>{isPublicRoute ? 'Back to fundraisers' : 'Back to campaigns'}</Link>
            </Button>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {canManageCampaign && campaign.slug ? (
                <>
                  <Button type="button" variant="outline" className="rounded-xl bg-background/70" onClick={copyPublicLink}>Copy public link</Button>
                  <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
                    <Link to={`/fundraisers/${campaign.slug}`}>Open public page</Link>
                  </Button>
                </>
              ) : (
                <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
                  <Link to={isPublicRoute ? '/auth?mode=signup' : '/campaigns/new'}>{isPublicRoute ? 'Start a fundraiser' : 'Create another campaign'}</Link>
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
    </AppShell>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import CampaignProgress, { formatCampaignCurrency } from '@/components/campaigns/CampaignProgress'
import CampaignStatusBadge from '@/components/campaigns/CampaignStatusBadge'
import CampaignStateCard from '@/components/campaigns/CampaignStateCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CampaignDetailRecord {
  id: string
  user_id: string
  title: string | null
  slug: string | null
  description: string | null
  story: string | null
  goal_amount: number | null
  current_amount: number | null
  status: string
  cover_image_url: string | null
  image_url?: string | null
  published_at: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<CampaignDetailRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState(false)

  const fetchCampaign = useCallback(async () => {
    if (!id || !user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      setError(fetchError.message)
      setCampaign(null)
    } else if (!data) {
      setError('Campaign not found.')
      setCampaign(null)
    } else {
      // Ensure the campaign belongs to the current user (additional client-side check)
      if (data.user_id !== user.id) {
        setError('Campaign not found.')
        setCampaign(null)
      } else {
        setCampaign(data as CampaignDetailRecord)
      }
    }

    setLoading(false)
  }, [id, user])

  useEffect(() => {
    fetchCampaign()
  }, [fetchCampaign])

  const updateStatus = useCallback(async (newStatus: string) => {
    if (!campaign || !user) return

    setActionBusy(true)

    const updates: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (newStatus === 'published' && !campaign.published_at) {
      // Validate required fields before publishing
      if (!campaign.title?.trim() || !campaign.story?.trim() || !campaign.goal_amount || !campaign.ends_at) {
        toast.error("Ensure title, story, goal, and end date are set before publishing.")
        setActionBusy(false)
        return
      }
      updates.published_at = new Date().toISOString()
    }

    if (newStatus === 'archived') {
      updates.archived_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', campaign.id)
      .eq('user_id', user.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Campaign ${newStatus === 'published' ? 'published' : 'archived'}.`)
      fetchCampaign()
    }

    setActionBusy(false)
  }, [campaign, user, fetchCampaign])

  const title = campaign?.title?.trim() || 'Untitled campaign'
  const description = campaign?.description?.trim() || 'No description provided.'
  const story = campaign?.story?.trim() || 'No story written yet. Add one in edit mode.'
  const coverImage = campaign?.cover_image_url || campaign?.image_url || null
  const currentAmount = campaign?.current_amount ?? 0
  const goalAmount = campaign?.goal_amount ?? 0
  const status = campaign?.status || 'draft'

  if (loading) {
    return (
      <AppShell maxWidthClassName="max-w-5xl" aria-label="Loading campaign details">
        <CampaignStateCard variant="loading" title="Loading campaign" description="Retrieving your campaign details..." />
      </AppShell>
    )
  }

  if (error || !campaign) {
    return (
      <AppShell maxWidthClassName="max-w-5xl" aria-label="Campaign not found">
        <CampaignStateCard
          variant="error"
          title="Campaign not found"
          description={error || "The campaign you're looking for doesn't exist or you don't have permission to view it."}
          actionLabel="Back to campaigns"
          actionTo="/campaigns"
        />
      </AppShell>
    )
  }

  return (
    <AppShell maxWidthClassName="max-w-5xl" contentClassName="space-y-6" aria-label={`Manage campaign: ${title}`}>
      <header className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-card/85 p-5 shadow-xl shadow-primary/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/campaigns"
          className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BrandMark subtitle="Campaign detail" />
        </Link>

        <nav className="flex flex-col gap-2 sm:flex-row sm:items-center" aria-label="Campaign detail navigation">
          <Button asChild variant="outline" className="rounded-xl bg-background/70">
            <Link to="/campaigns">Back to campaigns</Link>
          </Button>
          <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
            <Link to={`/campaigns/${campaign.id}/edit`}>Edit campaign</Link>
          </Button>
        </nav>
      </header>

      {/* Main campaign card */}
      <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          {/* Cover image */}
          <div className="relative min-h-64 overflow-hidden bg-gradient-to-br from-primary/20 via-accent/30 to-secondary/20 sm:min-h-80">
            {coverImage ? (
              <img src={coverImage} alt="" className="h-full min-h-64 w-full object-cover sm:min-h-80" />
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center sm:min-h-80">
                <span className="rounded-2xl border border-primary/20 bg-background/80 px-5 py-3 text-lg font-black text-primary shadow-sm backdrop-blur" aria-hidden="true">
                  Campaign Cover
                </span>
              </div>
            )}
            <div className="absolute left-4 top-4">
              <CampaignStatusBadge status={status} />
            </div>
          </div>

          {/* Details */}
          <div className="relative min-w-0 p-6 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/40 blur-3xl" aria-hidden="true" />
            <div className="relative z-10 min-w-0">
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>

              {/* Progress bar */}
              <div className="mt-8 rounded-3xl border border-primary/20 bg-background/75 p-5 shadow-sm backdrop-blur">
                <CampaignProgress currentAmount={currentAmount} goalAmount={goalAmount} />
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {goalAmount > 0
                    ? `${formatCampaignCurrency(currentAmount)} raised of ${formatCampaignCurrency(goalAmount)} goal.`
                    : 'Set a fundraising goal to track progress.'}
                </p>
              </div>

              {/* Management actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {status !== 'published' && (
                  <Button
                    type="button"
                    className="rounded-xl shadow-lg shadow-primary/20"
                    disabled={actionBusy}
                    onClick={() => updateStatus('published')}
                  >
                    {actionBusy ? 'Publishing...' : 'Publish campaign'}
                  </Button>
                )}
                {status !== 'archived' && (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl bg-background/70"
                    disabled={actionBusy}
                    onClick={() => updateStatus('archived')}
                  >
                    {actionBusy ? 'Archiving...' : 'Archive campaign'}
                  </Button>
                )}
                {campaign.slug && status === 'published' && (
                  <Button asChild variant="outline" className="rounded-xl bg-background/70">
                    <Link to={`/fundraisers/${campaign.slug}`}>View public page</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Story section */}
      <Card id="story" className="min-w-0 overflow-hidden border-primary/20 bg-card/90 shadow-lg shadow-primary/10 backdrop-blur">
        <CardHeader className="border-b border-border bg-muted/20">
          <CardTitle>The Story</CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">{story}</div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card className="border-primary/20 bg-card/90 shadow-sm backdrop-blur">
        <CardContent className="p-6">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-muted/30 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Slug</dt>
              <dd className="mt-1 truncate font-medium">{campaign.slug || 'Not set'}</dd>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</dt>
              <dd className="mt-1 font-medium">
                {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(campaign.created_at))}
              </dd>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Updated</dt>
              <dd className="mt-1 font-medium">
                {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(campaign.updated_at))}
              </dd>
            </div>
            {campaign.published_at && (
              <div className="rounded-2xl border border-border bg-muted/30 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Published</dt>
                <dd className="mt-1 font-medium">
                  {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(campaign.published_at))}
                </dd>
              </div>
            )}
            {campaign.archived_at && (
              <div className="rounded-2xl border border-border bg-muted/30 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Archived</dt>
                <dd className="mt-1 font-medium">
                  {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(campaign.archived_at))}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </AppShell>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import CampaignProgress, { formatCampaignCurrency } from '@/components/campaigns/CampaignProgress'
import CampaignStateCard from '@/components/campaigns/CampaignStateCard'
import type { PublicCampaignCardData } from '@/components/campaigns/PublicCampaignCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CampaignDetailRecord extends PublicCampaignCardData {
  status?: string | null
  story?: string | null
}

function getCampaignImage(campaign: CampaignDetailRecord): string | null {
  return campaign.cover_image_url || campaign.image_url || null
}

function getCurrentAmount(campaign: CampaignDetailRecord): number | string | null | undefined {
  return campaign.current_amount ?? campaign.amount_raised ?? campaign.raised_amount
}

function toMoneyNumber(value?: number | string | null) {
  const numericValue = Number(value ?? 0)
  return Number.isFinite(numericValue) ? Math.max(numericValue, 0) : 0
}

function getStory(campaign: CampaignDetailRecord): string {
  return (
    campaign.story?.trim() ||
    campaign.description?.trim() ||
    'This fundraiser is building momentum through Renderr. Check back as the creator adds more details and invites supporters into the story.'
  )
}

export default function CampaignDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [campaign, setCampaign] = useState<CampaignDetailRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const shareUrl = useMemo(() => {
    if (!slug || typeof window === 'undefined') return ''
    return `${window.location.origin}/fundraisers/${slug}`
  }, [slug])

  useEffect(() => {
    let active = true

    const loadCampaign = async () => {
      if (!slug) {
        setLoading(false)
        setError('This fundraiser link is missing a campaign slug.')
        return
      }

      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()

      if (!active) return

      if (fetchError) {
        setError(fetchError.message || 'Unable to load this fundraiser right now.')
        setCampaign(null)
      } else if (!data) {
        setError(null)
        setCampaign(null)
      } else {
        setCampaign(data as CampaignDetailRecord)
      }

      setLoading(false)
    }

    loadCampaign()

    return () => {
      active = false
    }
  }, [slug])

  const title = campaign?.title?.trim() || 'Fundraiser'
  const description = campaign?.description?.trim() || 'A public Renderr fundraiser gathering community support.'
  const imageUrl = campaign ? getCampaignImage(campaign) : null
  const currentAmount = campaign ? getCurrentAmount(campaign) : 0
  const goalAmount = campaign?.goal_amount
  const supporterPrompt = toMoneyNumber(goalAmount) > 0
    ? `${formatCampaignCurrency(currentAmount)} raised toward ${formatCampaignCurrency(goalAmount)}.`
    : `${formatCampaignCurrency(currentAmount)} raised so far.`

  return (
    <AppShell maxWidthClassName="max-w-7xl" contentClassName="space-y-8" aria-label="Fundraiser details">
      <header className="flex min-w-0 flex-col gap-4 rounded-3xl border border-primary/20 bg-card/85 p-5 shadow-xl shadow-primary/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <BrandMark subtitle="Fundraiser story" />
        </Link>

        <nav className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end" aria-label="Campaign detail navigation">
          <Button asChild variant="outline" className="rounded-xl bg-background/70">
            <Link to="/fundraisers">All fundraisers</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl bg-background/70">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
            <Link to="/signup">Start yours</Link>
          </Button>
        </nav>
      </header>

      {loading ? (
        <CampaignStateCard variant="loading" title="Loading fundraiser" description="We are opening this colorful Renderr campaign page." />
      ) : error ? (
        <CampaignStateCard
          variant="error"
          title="This fundraiser could not load"
          description={error}
          actionLabel="Browse fundraisers"
          actionTo="/fundraisers"
        />
      ) : !campaign ? (
        <CampaignStateCard
          variant="empty"
          title="Fundraiser not found"
          description="This public campaign may have been unpublished, archived, or moved. Browse the current fundraiser gallery instead."
          actionLabel="Browse fundraisers"
          actionTo="/fundraisers"
        />
      ) : (
        <>
          <section className="min-w-0 overflow-hidden rounded-3xl border border-primary/20 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur" aria-labelledby="campaign-title">
            <div className="grid min-w-0 gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="relative min-h-72 overflow-hidden bg-gradient-to-br from-primary/20 via-accent/30 to-secondary/20 sm:min-h-80">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="h-full min-h-72 w-full object-cover sm:min-h-80" />
                ) : (
                  <div className="flex h-full min-h-72 items-center justify-center sm:min-h-80">
                    <span className="rounded-2xl border border-primary/20 bg-background/80 px-5 py-3 text-lg font-black text-primary shadow-sm backdrop-blur" aria-hidden="true">
                      Renderr Fundraiser
                    </span>
                  </div>
                )}
                <div className="absolute left-5 top-5 rounded-full border border-primary/20 bg-background/85 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                  Published campaign
                </div>
              </div>

              <div className="relative min-w-0 overflow-hidden p-6 sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/40 blur-3xl" aria-hidden="true" />
                <div className="relative z-10 min-w-0">
                  <p className="text-sm font-semibold text-primary">Renderr fundraising story</p>
                  <h1 id="campaign-title" className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                    {title}
                  </h1>
                  <p className="mt-5 text-pretty text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>

                  <div className="mt-8 rounded-3xl border border-primary/20 bg-background/75 p-5 shadow-sm backdrop-blur">
                    <CampaignProgress currentAmount={currentAmount} goalAmount={goalAmount} />
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{supporterPrompt}</p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                      <a href="#support">Support this fundraiser</a>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-xl bg-background/70">
                      <a href={shareUrl ? `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Support this Renderr fundraiser: ${shareUrl}`)}` : '#story'}>
                        Share by email
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.75fr)]">
            <Card id="story" className="min-w-0 overflow-hidden border-primary/20 bg-card/90 shadow-lg shadow-primary/10 backdrop-blur">
              <CardHeader className="border-b border-border bg-muted/20">
                <CardTitle>The story behind this campaign</CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">{getStory(campaign)}</div>
              </CardContent>
            </Card>

            <aside id="support" className="min-w-0 space-y-5" aria-label="Support options">
              <Card className="overflow-hidden border-accent/70 bg-accent/25 shadow-lg shadow-accent/10 backdrop-blur">
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-primary">Donation CTA</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">Ready to help?</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Renderr is presenting the campaign story and funding progress here. Use the creator’s preferred next step when donations are connected.
                  </p>
                  <div className="mt-5 grid gap-2" aria-label="Suggested support amounts">
                    {['$25', '$50', '$100'].map((amount) => (
                      <div key={amount} className="rounded-2xl border border-primary/20 bg-background/75 p-3 text-center text-sm font-bold text-primary shadow-sm">
                        {amount}
                      </div>
                    ))}
                  </div>
                  <Button asChild className="mt-5 w-full rounded-xl shadow-lg shadow-primary/20">
                    <Link to="/signup">Create a fundraiser like this</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/90 shadow-sm backdrop-blur">
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-primary">Keep exploring</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Discover more colorful campaigns from the Renderr community.
                  </p>
                  <Button asChild variant="outline" className="mt-5 w-full rounded-xl bg-background/70">
                    <Link to="/fundraisers">Browse all fundraisers</Link>
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </>
      )}
    </AppShell>
  )
}

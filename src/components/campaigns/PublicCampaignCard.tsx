import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import CampaignProgress from '@/components/campaigns/CampaignProgress'

export interface PublicCampaignCardData {
  id?: string | number | null
  title?: string | null
  slug?: string | null
  description?: string | null
  cover_image_url?: string | null
  image_url?: string | null
  goal_amount?: number | string | null
  current_amount?: number | string | null
  amount_raised?: number | string | null
  raised_amount?: number | string | null
  created_at?: string | null
  published_at?: string | null
  [key: string]: unknown
}

interface PublicCampaignCardProps {
  campaign: PublicCampaignCardData
  featured?: boolean
}

function getCampaignImage(campaign: PublicCampaignCardData): string | null {
  return campaign.cover_image_url || campaign.image_url || null
}

function getCurrentAmount(campaign: PublicCampaignCardData): number | string | null | undefined {
  return campaign.current_amount ?? campaign.amount_raised ?? campaign.raised_amount
}

export default function PublicCampaignCard({ campaign, featured = false }: PublicCampaignCardProps) {
  const title = campaign.title?.trim() || 'Untitled fundraiser'
  const description = campaign.description?.trim() || 'This Renderr fundraiser is gathering support from the community.'
  const slug = campaign.slug?.trim()
  const href = slug ? `/fundraisers/${slug}` : '/fundraisers'
  const imageUrl = getCampaignImage(campaign)

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-primary/20 bg-card/90 shadow-lg shadow-primary/10 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/15">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-16 left-4 h-36 w-36 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className={featured ? 'grid gap-0 lg:grid-cols-[0.95fr_1.05fr]' : ''}>
        <div className={featured ? 'relative min-h-64 lg:min-h-full' : 'relative h-48'}>
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-accent/30 to-secondary/20">
              <span className="rounded-2xl border border-primary/20 bg-background/75 px-4 py-2 text-sm font-black text-primary shadow-sm backdrop-blur" aria-hidden="true">
                Renderr
              </span>
            </div>
          )}
          <div className="absolute left-4 top-4 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            Public fundraiser
          </div>
        </div>

        <div className="relative z-10 flex h-full flex-col p-5 sm:p-6">
          <div className="flex-1">
            <h3 className={featured ? 'text-2xl font-bold tracking-tight' : 'text-xl font-bold tracking-tight'}>
              <Link to={href} className="rounded-lg outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                {title}
              </Link>
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>

          <CampaignProgress
            className="mt-5"
            currentAmount={getCurrentAmount(campaign)}
            goalAmount={campaign.goal_amount}
            compact={!featured}
          />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
              <Link to={href}>View and support</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl bg-background/70">
              <Link to="/signup">Start yours</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

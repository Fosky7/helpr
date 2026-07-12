import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type CampaignStateVariant = 'empty' | 'error' | 'loading'

interface CampaignStateCardProps {
  variant?: CampaignStateVariant
  title: string
  description: ReactNode
  actionLabel?: string
  actionTo?: string
  onRetry?: () => void
}

const iconLabel: Record<CampaignStateVariant, string> = {
  empty: '○',
  error: '!',
  loading: '…',
}

export default function CampaignStateCard({
  variant = 'empty',
  title,
  description,
  actionLabel,
  actionTo,
  onRetry,
}: CampaignStateCardProps) {
  const isLoading = variant === 'loading'
  const isError = variant === 'error'

  return (
    <Card className="overflow-hidden border-primary/20 bg-card/90 text-center shadow-xl shadow-primary/10 backdrop-blur">
      <CardContent
        className="relative p-8 sm:p-10"
        role={isError ? 'alert' : 'status'}
        aria-live={isError ? 'assertive' : 'polite'}
        aria-busy={isLoading || undefined}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-14 bottom-0 h-44 w-44 rounded-full bg-accent/45 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25" aria-hidden="true">
            <span className="text-2xl font-black">{iconLabel[variant]}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <div className="mt-3 text-sm leading-6 text-muted-foreground">{description}</div>

          {actionLabel && actionTo ? (
            <Button asChild className="mt-6 rounded-xl shadow-lg shadow-primary/20">
              <Link to={actionTo}>{actionLabel}</Link>
            </Button>
          ) : null}

          {onRetry ? (
            <Button type="button" onClick={onRetry} className="mt-6 rounded-xl shadow-lg shadow-primary/20">
              Try again
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

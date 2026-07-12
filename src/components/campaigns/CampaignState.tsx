import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export type CampaignStateVariant = 'loading' | 'empty' | 'error'

interface CampaignStateProps {
  variant: CampaignStateVariant
  title?: string
  message?: string
  action?: ReactNode
  className?: string
}

const defaults: Record<CampaignStateVariant, { title: string; message: string; icon: string }> = {
  loading: {
    title: 'Loading campaigns',
    message: 'Please wait while we gather the latest campaign details.',
    icon: 'R',
  },
  empty: {
    title: 'No campaigns yet',
    message: 'Create your first fundraising campaign to start collecting support.',
    icon: '+',
  },
  error: {
    title: 'Unable to load campaigns',
    message: 'Something went wrong. Please try again in a moment.',
    icon: '!',
  },
}

function joinClassNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function CampaignState({ variant, title, message, action, className }: CampaignStateProps) {
  const content = defaults[variant]
  const isLoading = variant === 'loading'
  const isError = variant === 'error'

  return (
    <Card
      className={joinClassNames(
        'border-primary/20 bg-card/90 text-center shadow-sm shadow-primary/5',
        className,
      )}
      role={isError ? 'alert' : 'status'}
      aria-live={isLoading ? 'polite' : isError ? 'assertive' : 'polite'}
      aria-busy={isLoading || undefined}
    >
      <CardContent className="flex flex-col items-center p-8 sm:p-10">
        <div
          className={joinClassNames(
            'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl font-black shadow-lg',
            isError
              ? 'bg-destructive/10 text-destructive shadow-destructive/10'
              : 'bg-primary text-primary-foreground shadow-primary/20',
          )}
          aria-hidden="true"
        >
          {isLoading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
          ) : (
            content.icon
          )}
        </div>
        <h2 className="text-xl font-bold tracking-tight">{title || content.title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{message || content.message}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </CardContent>
    </Card>
  )
}

export function CampaignLoadingState(props: Omit<CampaignStateProps, 'variant'>) {
  return <CampaignState {...props} variant="loading" />
}

export function CampaignEmptyState(props: Omit<CampaignStateProps, 'variant'>) {
  return <CampaignState {...props} variant="empty" />
}

interface CampaignErrorStateProps extends Omit<CampaignStateProps, 'variant' | 'action'> {
  onRetry?: () => void
  retryLabel?: string
  action?: ReactNode
}

export function CampaignErrorState({ onRetry, retryLabel = 'Try again', action, ...props }: CampaignErrorStateProps) {
  return (
    <CampaignState
      {...props}
      variant="error"
      action={
        action ||
        (onRetry ? (
          <Button type="button" onClick={onRetry} className="rounded-xl shadow-lg shadow-primary/20">
            {retryLabel}
          </Button>
        ) : undefined)
      }
    />
  )
}

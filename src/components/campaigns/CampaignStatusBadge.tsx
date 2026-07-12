export type CampaignStatus = 'draft' | 'published' | 'archived'

interface CampaignStatusBadgeProps {
  status?: CampaignStatus | string | null
  className?: string
}

const statusStyles: Record<CampaignStatus, string> = {
  draft: 'border-border bg-muted/60 text-muted-foreground',
  published: 'border-primary/25 bg-primary/10 text-primary',
  archived: 'border-accent/70 bg-accent/35 text-foreground',
}

const statusLabels: Record<CampaignStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function normalizeStatus(status?: CampaignStatus | string | null): CampaignStatus {
  if (status === 'published' || status === 'archived' || status === 'draft') return status
  return 'draft'
}

export default function CampaignStatusBadge({ status, className }: CampaignStatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm',
        statusStyles[normalizedStatus],
        className,
      )}
    >
      <span className="sr-only">Campaign status: </span>
      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {statusLabels[normalizedStatus]}
    </span>
  )
}

export { CampaignStatusBadge, normalizeStatus }

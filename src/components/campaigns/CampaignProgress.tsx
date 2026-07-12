interface CampaignProgressProps {
  goalAmount?: number | string | null
  currentAmount?: number | string | null
  compact?: boolean
  className?: string
}

const currencyFormatter = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function toMoneyNumber(value?: number | string | null) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? Math.max(numericValue, 0) : 0
}

export function formatCampaignCurrency(value?: number | string | null) {
  return currencyFormatter.format(toMoneyNumber(value))
}

export const formatCurrency = formatCampaignCurrency

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function CampaignProgress({ goalAmount, currentAmount, compact = false, className }: CampaignProgressProps) {
  const goal = toMoneyNumber(goalAmount)
  const raised = toMoneyNumber(currentAmount)
  const percentage = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0

  return (
    <div className={joinClasses('space-y-3', className)} aria-label={`${percentage}% funded`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Raised</p>
          <p className={compact ? 'text-lg font-black text-primary' : 'text-2xl font-black text-primary'}>
            {formatCampaignCurrency(raised)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Goal</p>
          <p className="text-sm font-semibold text-foreground">{formatCampaignCurrency(goal)}</p>
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
      </div>

      <p className="text-xs font-medium text-muted-foreground">
        {percentage}% funded{goal <= 0 ? ' · Add a goal to activate progress tracking.' : ''}
      </p>
    </div>
  )
}

export { CampaignProgress }

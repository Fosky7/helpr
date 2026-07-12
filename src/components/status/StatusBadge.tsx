import type { HTMLAttributes } from 'react'

export type StatusBadgeValue = 'complete' | 'partial' | 'pending' | 'completed' | 'in-progress' | 'upcoming'

type StatusBadgeSize = 'sm' | 'md'

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusBadgeValue
  label?: string
  size?: StatusBadgeSize
}

const statusMeta: Record<StatusBadgeValue, { label: string; icon: string; className: string; srText: string }> = {
  complete: {
    label: 'Complete',
    icon: '✓',
    className: 'border-primary/30 bg-primary/10 text-primary shadow-primary/10',
    srText: 'Complete status',
  },
  completed: {
    label: 'Completed',
    icon: '✓',
    className: 'border-primary/30 bg-primary/10 text-primary shadow-primary/10',
    srText: 'Completed status',
  },
  partial: {
    label: 'Partial',
    icon: '◐',
    className: 'border-accent/70 bg-accent/30 text-foreground shadow-accent/10',
    srText: 'Partially complete status',
  },
  'in-progress': {
    label: 'In progress',
    icon: '↻',
    className: 'border-accent/70 bg-accent/30 text-foreground shadow-accent/10',
    srText: 'In progress status',
  },
  pending: {
    label: 'Pending',
    icon: '…',
    className: 'border-border bg-muted/60 text-muted-foreground shadow-primary/5',
    srText: 'Pending status',
  },
  upcoming: {
    label: 'Upcoming',
    icon: '→',
    className: 'border-secondary/40 bg-secondary/10 text-foreground shadow-primary/5',
    srText: 'Upcoming status',
  },
}

const sizeClasses: Record<StatusBadgeSize, string> = {
  sm: 'gap-1.5 px-2.5 py-1 text-[0.7rem]',
  md: 'gap-2 px-3 py-1.5 text-xs',
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function StatusBadge({ status, label, size = 'md', className, ...props }: StatusBadgeProps) {
  const meta = statusMeta[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-bold uppercase tracking-wide shadow-sm backdrop-blur',
        sizeClasses[size],
        meta.className,
        className,
      )}
      {...props}
    >
      <span className="sr-only">{meta.srText}: </span>
      <span
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-background/75 text-[0.65rem] leading-none ring-1 ring-current/15"
        aria-hidden="true"
      >
        {meta.icon}
      </span>
      <span>{label ?? meta.label}</span>
    </span>
  )
}

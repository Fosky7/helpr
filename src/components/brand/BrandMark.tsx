import type { HTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type BrandMarkSize = 'sm' | 'md' | 'lg'

interface BrandMarkProps extends HTMLAttributes<HTMLDivElement> {
  compact?: boolean
  title?: string
  subtitle?: string
  size?: BrandMarkSize
  to?: string
  trailing?: ReactNode
}

const sizeClasses: Record<BrandMarkSize, { mark: string; letter: string; title: string; subtitle: string }> = {
  sm: {
    mark: 'h-10 w-10 rounded-xl',
    letter: 'text-base',
    title: 'text-sm',
    subtitle: 'text-xs',
  },
  md: {
    mark: 'h-12 w-12 rounded-2xl',
    letter: 'text-lg',
    title: 'text-sm',
    subtitle: 'text-xs',
  },
  lg: {
    mark: 'h-14 w-14 rounded-2xl',
    letter: 'text-xl',
    title: 'text-base',
    subtitle: 'text-sm',
  },
}

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function BrandMarkContent({
  compact,
  title,
  subtitle,
  size,
  trailing,
}: Pick<BrandMarkProps, 'compact' | 'title' | 'subtitle' | 'size' | 'trailing'>) {
  const classes = sizeClasses[size ?? 'md']

  return (
    <>
      <div
        className={joinClasses(
          'relative flex shrink-0 items-center justify-center overflow-hidden bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/20',
          classes.mark,
        )}
      >
        <span className="absolute inset-0 bg-accent/20" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-accent ring-2 ring-card" aria-hidden="true" />
        <span className={joinClasses('relative z-10 font-black tracking-tight', classes.letter)} aria-hidden="true">
          R
        </span>
      </div>

      <div className="min-w-0">
        <p className={joinClasses('font-semibold leading-none tracking-tight text-primary', classes.title)}>{title}</p>
        {!compact ? <p className={joinClasses('mt-1 truncate text-muted-foreground', classes.subtitle)}>{subtitle}</p> : null}
      </div>

      {trailing ? <div className="ml-auto">{trailing}</div> : null}
    </>
  )
}

export function BrandMark({
  compact = false,
  title = 'Renderr',
  subtitle = 'Colorful creator workspace',
  size = 'md',
  to,
  trailing,
  className,
  ...props
}: BrandMarkProps) {
  const rootClassName = joinClasses('flex items-center gap-3', className)

  if (to) {
    return (
      <Link
        to={to}
        className={joinClasses(
          rootClassName,
          'rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        <BrandMarkContent compact={compact} title={title} subtitle={subtitle} size={size} trailing={trailing} />
      </Link>
    )
  }

  return (
    <div className={rootClassName} {...props}>
      <BrandMarkContent compact={compact} title={title} subtitle={subtitle} size={size} trailing={trailing} />
    </div>
  )
}

export default BrandMark

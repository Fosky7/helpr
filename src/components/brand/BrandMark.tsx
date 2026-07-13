import type { HTMLAttributes } from 'react'

type BrandMarkSize = 'sm' | 'md' | 'lg'

type BrandMarkProps = HTMLAttributes<HTMLDivElement> & {
  subtitle?: string
  compact?: boolean
  size?: BrandMarkSize
}

const sizeStyles: Record<BrandMarkSize, { mark: string; title: string; subtitle: string; gap: string }> = {
  sm: {
    mark: 'h-9 w-9 rounded-2xl',
    title: 'text-lg',
    subtitle: 'text-[0.68rem]',
    gap: 'gap-2.5',
  },
  md: {
    mark: 'h-11 w-11 rounded-2xl',
    title: 'text-xl',
    subtitle: 'text-xs',
    gap: 'gap-3',
  },
  lg: {
    mark: 'h-14 w-14 rounded-3xl',
    title: 'text-2xl',
    subtitle: 'text-sm',
    gap: 'gap-4',
  },
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function BrandMark({ subtitle, compact = false, size = 'md', className, ...props }: BrandMarkProps) {
  const styles = sizeStyles[size]

  return (
    <div className={cx('inline-flex min-w-0 items-center', styles.gap, className)} {...props}>
      <div
        className={cx(
          'relative flex shrink-0 items-center justify-center overflow-hidden border border-primary/25 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-background/60',
          styles.mark,
        )}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/25 via-transparent to-background/15" />
        <div className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-primary-foreground/25 blur-md" />
        <div className="absolute -bottom-3 -left-3 h-8 w-8 rounded-full bg-background/20 blur-md" />

        <svg className="relative z-10 h-[62%] w-[62%] drop-shadow-sm" viewBox="0 0 64 64" role="img" aria-label="Renderr logo mark">
          <path
            d="M18 49V15h17.5c7.8 0 13.3 4.8 13.3 11.9 0 5.1-2.9 9-7.3 10.7L51 49H39.6l-8.1-10.2h-3.2V49H18Zm10.3-18.7h6.4c2.5 0 4.1-1.3 4.1-3.4s-1.6-3.4-4.1-3.4h-6.4v6.8Z"
            fill="currentColor"
          />
          <path
            d="M14 17.5c0-3 2.5-5.5 5.5-5.5H36"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="4"
            opacity="0.72"
          />
          <path
            d="M46.5 13.5 49 19l5.5 2.5L49 24l-2.5 5.5L44 24l-5.5-2.5L44 19l2.5-5.5Z"
            fill="currentColor"
            opacity="0.9"
          />
        </svg>
      </div>

      {compact ? (
        <span className="sr-only">Renderr</span>
      ) : (
        <span className="min-w-0 leading-none">
          <span className={cx('block truncate font-black tracking-tight text-foreground', styles.title)}>Renderr</span>
          {subtitle ? (
            <span className={cx('mt-1 block truncate font-semibold uppercase tracking-[0.18em] text-muted-foreground', styles.subtitle)}>
              {subtitle}
            </span>
          ) : null}
        </span>
      )}
    </div>
  )
}

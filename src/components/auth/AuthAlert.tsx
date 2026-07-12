import type { HTMLAttributes, ReactNode } from 'react'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type AuthAlertVariant = 'error' | 'success' | 'info' | 'warning'

interface AuthAlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: AuthAlertVariant
  title?: string
}

const alertStyles: Record<AuthAlertVariant, { container: string; icon: string; label: string; glyph: string; defaultTitle: string }> = {
  error: {
    container: 'border-destructive/40 bg-destructive/10 text-foreground shadow-destructive/10',
    icon: 'bg-destructive text-destructive-foreground',
    label: 'text-destructive',
    glyph: '!',
    defaultTitle: 'Something needs attention',
  },
  success: {
    container: 'border-primary/30 bg-primary/10 text-foreground shadow-primary/10',
    icon: 'bg-primary text-primary-foreground',
    label: 'text-primary',
    glyph: '✓',
    defaultTitle: 'Success',
  },
  info: {
    container: 'border-primary/25 bg-background/80 text-foreground shadow-primary/10',
    icon: 'bg-primary text-primary-foreground',
    label: 'text-primary',
    glyph: 'i',
    defaultTitle: 'Heads up',
  },
  warning: {
    container: 'border-accent/70 bg-accent/35 text-foreground shadow-accent/10',
    icon: 'bg-foreground text-background',
    label: 'text-foreground',
    glyph: '!',
    defaultTitle: 'Please review',
  },
}

export function AuthAlert({
  children,
  variant = 'info',
  title,
  className,
  ...props
}: AuthAlertProps) {
  const styles = alertStyles[variant]
  const alertTitle = title ?? styles.defaultTitle
  const isError = variant === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={cx(
        'rounded-2xl border p-4 shadow-sm backdrop-blur',
        styles.container,
        className,
      )}
      {...props}
    >
      <div className="flex gap-3">
        <span
          className={cx(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black shadow-sm',
            styles.icon,
          )}
          aria-hidden="true"
        >
          {styles.glyph}
        </span>

        <div className="min-w-0 space-y-1">
          {alertTitle ? (
            <p className={cx('text-sm font-bold leading-5', styles.label)}>{alertTitle}</p>
          ) : null}
          <div className="text-sm leading-6 text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  )
}

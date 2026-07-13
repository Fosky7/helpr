import type { HTMLAttributes, ReactNode } from 'react'

type AppShellBackground = 'default' | 'celebration' | 'subtle'

interface AppShellProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  centered?: boolean
  maxWidthClassName?: string
  contentClassName?: string
  background?: AppShellBackground
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const backgroundClasses: Record<AppShellBackground, string> = {
  default: 'bg-background',
  subtle: 'bg-gradient-to-br from-background via-muted/30 to-background',
  celebration: 'bg-gradient-to-br from-background via-accent/20 to-primary/10',
}

export default function AppShell({
  children,
  centered = false,
  maxWidthClassName = 'max-w-7xl',
  contentClassName,
  background = 'default',
  className,
  ...mainProps
}: AppShellProps) {
  return (
    <main
      className={cx(
        'relative min-h-screen overflow-x-hidden text-foreground',
        backgroundClasses[background],
        className,
      )}
      {...mainProps}
    >
      {background === 'celebration' ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-accent/35 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>
      ) : null}

      <div
        className={cx(
          'relative z-10 mx-auto flex min-h-screen w-full flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8',
          centered ? 'justify-center' : 'justify-start',
          maxWidthClassName,
          contentClassName,
        )}
      >
        {children}
      </div>
    </main>
  )
}

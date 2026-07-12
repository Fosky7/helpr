import type { ReactNode } from 'react'

interface AuthCardProps {
  children: ReactNode
  title?: string
  description?: string
  eyebrow?: string
}

export default function AuthCard({
  children,
  title = 'Welcome to Renderr',
  description = 'Use your secure account details to continue.',
  eyebrow = 'Secure access',
}: AuthCardProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-accent/50 blur-3xl" />
        <div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-primary/20" />
      </div>

      <div className="relative border-b border-primary/15 bg-background/60 px-6 py-6 sm:px-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            {eyebrow}
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-7 rounded-full bg-primary" />
            <span className="h-2.5 w-4 rounded-full bg-accent" />
            <span className="h-2.5 w-6 rounded-full bg-primary/40" />
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div className="relative bg-card/70 px-6 py-6 sm:px-7 sm:py-7">{children}</div>
    </section>
  )
}

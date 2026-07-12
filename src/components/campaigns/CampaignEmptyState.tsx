import type { ReactNode } from 'react'

interface CampaignEmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export default function CampaignEmptyState({ title, description, action }: CampaignEmptyStateProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-dashed border-primary/30 bg-card/80 p-8 text-center shadow-sm backdrop-blur">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-12 top-4 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-accent/45 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <span className="text-2xl font-black" aria-hidden="true">R</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </div>
    </section>
  )
}

export { CampaignEmptyState }

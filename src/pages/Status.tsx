import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import BackNavigation from '@/components/navigation/BackNavigation'
import FeatureStatusCard from '@/components/status/FeatureStatusCard'
import StatusBadge from '@/components/status/StatusBadge'
import {
  completionScore,
  currentStatusAnswer,
  statusDescriptions,
  statusFeatures,
  statusSummary,
  type RenderrFeatureStatus,
} from '@/lib/status'

const statusGroups: Array<{
  status: RenderrFeatureStatus
  title: string
  description: string
}> = [
  {
    status: 'complete',
    title: 'Done and usable',
    description: statusDescriptions.complete,
  },
  {
    status: 'partial',
    title: 'Partially complete',
    description: statusDescriptions.partial,
  },
  {
    status: 'pending',
    title: 'Still pending',
    description: statusDescriptions.pending,
  },
]

const summaryCards = [
  {
    label: 'Tracked modules',
    value: statusSummary.total,
    description: 'Major Renderr product areas included in this snapshot.',
    className: 'border-primary/20 bg-card/90',
  },
  {
    label: 'Complete',
    value: statusSummary.complete,
    description: 'Features implemented and available today.',
    className: 'border-primary/25 bg-primary/10',
  },
  {
    label: 'Pending',
    value: statusSummary.pending,
    description: 'Features still waiting for implementation.',
    className: 'border-secondary/40 bg-secondary/10',
  },
]

export default function Status() {
  return (
    <AppShell maxWidthClassName="max-w-6xl" contentClassName="space-y-8" aria-label="Renderr product status">
      <header className="overflow-hidden rounded-3xl border border-primary/20 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
        <nav className="flex flex-col gap-4 border-b border-primary/20 bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between" aria-label="Status navigation">
          <Link to="/status" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <BrandMark subtitle="Product status" />
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <BackNavigation fallbackTo="/" />
            <Button asChild variant="outline" className="rounded-xl bg-background/70">
              <Link to="/fundraisers">Browse Fundraisers</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl bg-background/70">
              <Link to="/auth?mode=login">Sign in</Link>
            </Button>
            <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
              <Link to="/auth?mode=signup">Start a fundraiser</Link>
            </Button>
          </div>
        </nav>

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.75fr] lg:items-center">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-16 -top-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-accent/45 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <StatusBadge status="partial" label="Answer: not fully done yet" className="mb-5" />
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Is Renderr done yet?
            </h1>
            <p className="mt-5 text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              {currentStatusAnswer}
            </p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This page summarizes the major modules currently represented in the app with labels, icon shapes, and card borders so status is not communicated by color alone.
            </p>
          </div>

          <Card className="relative z-10 border-primary/20 bg-background/75 shadow-lg shadow-primary/10 backdrop-blur">
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current completion signal</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black text-primary">{completionScore}%</span>
                <span className="pb-2 text-sm font-medium text-muted-foreground">weighted complete</span>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div className="h-full rounded-full bg-primary shadow-sm shadow-primary/30" style={{ width: `${completionScore}%` }} />
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Complete modules count fully and partially complete modules count halfway toward this lightweight product-readiness score.
              </p>
            </CardContent>
          </Card>
        </div>
      </header>

      <section aria-label="Status summary" className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((item) => (
          <Card key={item.label} className={`rounded-3xl shadow-sm backdrop-blur transition-colors hover:border-primary/35 ${item.className}`}>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-3 text-3xl font-black text-primary">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-8" aria-labelledby="module-status-title">
        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-card/85 p-6 shadow-lg shadow-primary/10 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Module-by-module snapshot</p>
              <h2 id="module-status-title" className="mt-2 text-3xl font-bold tracking-tight">
                What is complete, partial, or pending?
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Use the links inside available cards to smoke test public routes and authenticated workflows. Protected routes will still redirect unauthenticated visitors through the existing auth guard.
            </p>
          </div>
        </div>

        {statusGroups.map((group) => {
          const features = statusFeatures.filter((feature) => feature.status === group.status)

          if (features.length === 0) return null

          return (
            <section key={group.status} aria-labelledby={`${group.status}-status-heading`} className="space-y-4">
              <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card/75 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={group.status} />
                    <h3 id={`${group.status}-status-heading`} className="text-xl font-bold tracking-tight">
                      {group.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{group.description}</p>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {features.length} {features.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {features.map((feature) => (
                  <FeatureStatusCard key={feature.id} feature={feature} />
                ))}
              </div>
            </section>
          )
        })}
      </section>
    </AppShell>
  )
}

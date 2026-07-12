import { Link } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import StatusBadge from '@/components/status/StatusBadge'
import {
  getProjectStatusSummary,
  getProjectStatusUpdatedAt,
} from '@/lib/projectStatus'
import type { ProjectStatusModule } from '@/types/projectStatus'

interface StatusModuleCardProps {
  module?: ProjectStatusModule
}

const moduleTone = {
  completed: 'border-primary/25 bg-primary/5',
  'in-progress': 'border-accent/70 bg-accent/15',
  upcoming: 'border-secondary/40 bg-secondary/10',
} as const

function formatDate(value: string) {
  if (!value) return 'Not available'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function SummaryStatusModuleCard() {
  const summary = getProjectStatusSummary()
  const updatedAt = getProjectStatusUpdatedAt()

  return (
    <AppShell centered maxWidthClassName="max-w-2xl" background="celebration" aria-label="Renderr status module">
      <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
        <CardHeader className="border-b border-primary/20 bg-gradient-to-br from-primary/10 via-accent/25 to-card p-6">
          <BrandMark subtitle="Status module" />
          <div className="mt-5 inline-flex w-fit rounded-full border border-primary/20 bg-background/75 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            Renderr status module
          </div>
          <CardTitle className="mt-4 text-3xl tracking-tight">Product readiness snapshot</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Production-ready</p>
            <p className="mt-3 text-5xl font-black text-primary">{summary.productionReadyPercentage}%</p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${summary.productionReadyPercentage}%` }} />
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {summary.completed} completed, {summary.inProgress} in progress, and {summary.upcoming} upcoming modules are tracked.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-primary/20 bg-card/80 p-4">
              <StatusBadge status="completed" size="sm" />
              <p className="mt-3 text-2xl font-black text-primary">{summary.completed}</p>
            </div>
            <div className="rounded-2xl border border-accent/70 bg-accent/20 p-4">
              <StatusBadge status="in-progress" size="sm" />
              <p className="mt-3 text-2xl font-black text-primary">{summary.inProgress}</p>
            </div>
            <div className="rounded-2xl border border-secondary/40 bg-secondary/10 p-4">
              <StatusBadge status="upcoming" size="sm" />
              <p className="mt-3 text-2xl font-black text-primary">{summary.upcoming}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-border bg-muted/20 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Updated {formatDate(updatedAt)}</p>
          <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
            <Link to="/status">Open full status</Link>
          </Button>
        </CardFooter>
      </Card>
    </AppShell>
  )
}

export default function StatusModuleCard({ module }: StatusModuleCardProps) {
  if (!module) return <SummaryStatusModuleCard />

  return (
    <article className={`rounded-3xl border p-5 shadow-sm backdrop-blur ${moduleTone[module.status]}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{module.module}</p>
          <h3 className="mt-1 text-xl font-bold tracking-tight">{module.title}</h3>
        </div>
        <StatusBadge status={module.status} />
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">{module.summary}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{module.details}</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-primary/20 bg-card/70 p-4">
          <h4 className="text-sm font-bold">Already handled</h4>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {module.completedItems.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary ring-1 ring-primary/20" aria-hidden="true">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <h4 className="text-sm font-bold">Next steps</h4>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {module.nextSteps.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-black text-muted-foreground ring-1 ring-border" aria-hidden="true">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}

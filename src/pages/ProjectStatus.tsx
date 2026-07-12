import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import BackNavigation from '@/components/navigation/BackNavigation'
import StatusBadge from '@/components/status/StatusBadge'
import {
  getProjectStatusGroups,
  getProjectStatusSummary,
  getProjectStatusUpdatedAt,
  projectStatusLabels,
} from '@/lib/projectStatus'
import type { ProjectModuleStatus, ProjectStatusModule, ProjectStatusSummary } from '@/types/projectStatus'

const statusTone: Record<ProjectModuleStatus, string> = {
  completed: 'border-primary/25 bg-primary/5 shadow-primary/10 hover:border-primary/40',
  'in-progress': 'border-accent/70 bg-accent/15 shadow-accent/10 hover:border-accent',
  upcoming: 'border-secondary/40 bg-secondary/10 shadow-primary/5 hover:border-secondary/60',
}

const statusPanelTone: Record<ProjectModuleStatus, string> = {
  completed: 'border-primary/20 bg-primary/5',
  'in-progress': 'border-accent/70 bg-accent/20',
  upcoming: 'border-dashed border-secondary/40 bg-background/65',
}

function formatDate(value: string) {
  if (!value) return 'Not available'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function StatusPill({ status }: { status: ProjectModuleStatus }) {
  return <StatusBadge status={status} label={projectStatusLabels[status]} />
}

function StatusSummary({ summary }: { summary: ProjectStatusSummary }) {
  const items = [
    { label: 'Production-ready', value: summary.completed, description: 'Completed modules', status: 'completed' as const, className: 'border-primary/25 bg-primary/10' },
    { label: 'Active build', value: summary.inProgress, description: 'In-progress modules', status: 'in-progress' as const, className: 'border-accent/70 bg-accent/25' },
    { label: 'Planned', value: summary.upcoming, description: 'Upcoming modules', status: 'upcoming' as const, className: 'border-secondary/40 bg-secondary/10' },
  ]

  return (
    <section aria-labelledby="status-summary-title" className="grid gap-4 md:grid-cols-[1.2fr_repeat(3,0.8fr)]">
      <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur md:row-span-1">
        <CardHeader className="border-b border-primary/15 bg-gradient-to-br from-primary/10 via-accent/25 to-card">
          <CardTitle id="status-summary-title">Is it done yet?</CardTitle>
          <CardDescription>
            {summary.productionReadyPercentage}% of tracked Renderr product modules are marked production-ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-3 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div
              className="h-full rounded-full bg-primary shadow-sm shadow-primary/30 transition-all"
              style={{ width: `${summary.productionReadyPercentage}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {summary.completed} of {summary.total} modules are done. Remaining work is separated into active build and planned roadmap items.
          </p>
        </CardContent>
      </Card>

      {items.map((item) => (
        <Card key={item.label} className={`rounded-3xl shadow-sm backdrop-blur transition-colors hover:border-primary/35 ${item.className}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <StatusBadge status={item.status} size="sm" />
            </div>
            <p className="mt-3 text-3xl font-black text-primary">{item.value}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

function ModuleCard({ module }: { module: ProjectStatusModule }) {
  return (
    <article className={`rounded-3xl border p-5 shadow-sm backdrop-blur transition-colors sm:p-6 ${statusTone[module.status]}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{module.module}</p>
          <h3 className="mt-1 text-xl font-bold tracking-tight">{module.title}</h3>
        </div>
        <StatusPill status={module.status} />
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">{module.summary}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{module.details}</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className={`rounded-2xl border p-4 ${statusPanelTone[module.status]}`}>
          <h4 className="text-sm font-bold">What is already handled</h4>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {module.completedItems.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary ring-1 ring-primary/20" aria-hidden="true">
                  ✓
                </span>
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
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-black text-muted-foreground ring-1 ring-border" aria-hidden="true">
                  →
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="mt-5 flex flex-col gap-2 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Owner: {module.owner}</span>
        <span>Updated {formatDate(module.updatedAt)}</span>
      </footer>
    </article>
  )
}

export default function ProjectStatus() {
  const summary = getProjectStatusSummary()
  const groups = getProjectStatusGroups()
  const updatedAt = getProjectStatusUpdatedAt()

  return (
    <AppShell maxWidthClassName="max-w-6xl" contentClassName="space-y-6" aria-label="Renderr project status">
      <header className="overflow-hidden rounded-3xl border border-primary/20 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
        <nav className="flex flex-col gap-3 border-b border-primary/20 bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between" aria-label="Status navigation">
          <Link to="/dashboard" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <BrandMark subtitle="Product status" />
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <BackNavigation fallbackTo="/dashboard" />
            <Button asChild variant="outline" className="rounded-xl bg-background/70">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
              <Link to="/campaigns">Open Campaigns</Link>
            </Button>
          </div>
        </nav>

        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-16 -top-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-accent/45 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              Last updated {formatDate(updatedAt)}
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Is Renderr done yet?
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              Here is the source-controlled snapshot of what is production-ready, what is actively being built, and what is still planned for Renderr.
            </p>
          </div>
        </div>
      </header>

      <StatusSummary summary={summary} />

      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.status} aria-labelledby={`${group.status}-modules-title`} className="space-y-4">
            <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card/75 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill status={group.status} />
                  <h2 id={`${group.status}-modules-title`} className="text-2xl font-bold tracking-tight">
                    {group.label}
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{group.description}</p>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {group.modules.length} {group.modules.length === 1 ? 'module' : 'modules'}
              </p>
            </div>

            {group.modules.length > 0 ? (
              <div className="grid gap-4">
                {group.modules.map((module) => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed bg-card/70">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No modules are currently listed in this status.
                </CardContent>
              </Card>
            )}
          </section>
        ))}
      </div>
    </AppShell>
  )
}

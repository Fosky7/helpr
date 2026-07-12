import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export type StatusState = 'completed' | 'in-progress' | 'upcoming'

export interface StatusChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface StatusModule {
  id: string
  title: string
  description: string
  status: StatusState
  progress: number
  owner: string
  target: string
  summary: string
  completed: string[]
  inProgress: string[]
  upcoming: string[]
  links?: Array<{
    label: string
    href: string
  }>
}

export const STATUS_LABELS: Record<StatusState, string> = {
  completed: 'Production-ready',
  'in-progress': 'In progress',
  upcoming: 'Upcoming',
}

export const STATUS_SHORT_LABELS: Record<StatusState, string> = {
  completed: 'Done',
  'in-progress': 'Building',
  upcoming: 'Next',
}

export const STATUS_DESCRIPTIONS: Record<StatusState, string> = {
  completed: 'Available for authenticated users now.',
  'in-progress': 'Actively being implemented and verified.',
  upcoming: 'Planned for a later build step.',
}

export const projectStatusModules: StatusModule[] = [
  {
    id: 'authentication',
    title: 'Authentication and profiles',
    description: 'Secure account access, protected routes, and editable user profile details.',
    status: 'completed',
    progress: 100,
    owner: 'Core app',
    target: 'Ready now',
    summary: 'Supabase authentication, profile loading, and protected dashboard routes are production-ready.',
    completed: [
      'Email and password signup with validation feedback.',
      'Email and password login with accessible error messaging.',
      'Protected dashboard, campaign, and profile routes.',
      'Profile settings backed by the existing Supabase profiles table.',
    ],
    inProgress: [],
    upcoming: ['Avatar upload and richer public profile personalization.'],
    links: [
      { label: 'Open dashboard', href: '/dashboard' },
      { label: 'Edit profile', href: '/profile' },
    ],
  },
  {
    id: 'campaign-management',
    title: 'Campaign management',
    description: 'Organizer workspace for creating, editing, publishing, archiving, and deleting draft campaigns.',
    status: 'completed',
    progress: 100,
    owner: 'Fundraising module',
    target: 'Ready now',
    summary: 'Authenticated organizers can manage the full campaign lifecycle from the Renderr dashboard.',
    completed: [
      'Create campaign drafts with goal, story, category, location, and cover image fields.',
      'Edit existing campaigns and publish complete drafts.',
      'Archive published campaigns so they no longer appear publicly.',
      'Delete draft campaigns with confirmation safeguards.',
    ],
    inProgress: [],
    upcoming: ['Bulk campaign analytics and organizer-level reporting.'],
    links: [
      { label: 'Manage campaigns', href: '/campaigns' },
      { label: 'Create campaign', href: '/campaigns/new' },
    ],
  },
  {
    id: 'public-fundraisers',
    title: 'Public fundraiser browsing',
    description: 'Published campaign discovery and campaign detail pages for supporters.',
    status: 'completed',
    progress: 100,
    owner: 'Public experience',
    target: 'Ready now',
    summary: 'Supporters can browse and search published fundraisers without signing in.',
    completed: [
      'Public fundraiser listing displays published campaigns only.',
      'Search filters fundraisers by title, story, category, summary, and location.',
      'Campaign cards expose clear progress, status, and detail links.',
      'Public campaign detail pages are available by campaign slug.',
    ],
    inProgress: [],
    upcoming: ['Featured campaigns and richer discovery filters.'],
    links: [{ label: 'Browse fundraisers', href: '/fundraisers' }],
  },
  {
    id: 'donations-payments',
    title: 'Donations and payments',
    description: 'Supporter checkout, donation records, receipts, and payment provider wiring.',
    status: 'in-progress',
    progress: 35,
    owner: 'Payments module',
    target: 'Next build milestone',
    summary: 'Donation UX is planned next; public pages currently prepare supporters for upcoming payment support.',
    completed: ['Campaign funding goals and raised totals are represented in the data model and UI.'],
    inProgress: [
      'Checkout flow requirements and payment provider boundaries.',
      'Donation record structure for supporter contributions.',
    ],
    upcoming: [
      'Secure checkout experience.',
      'Donation confirmation and receipt messaging.',
      'Organizer donation history and totals reconciliation.',
    ],
  },
  {
    id: 'admin-analytics',
    title: 'Admin, analytics, and operations',
    description: 'Operational views for moderation, platform metrics, support workflows, and auditability.',
    status: 'upcoming',
    progress: 10,
    owner: 'Operations module',
    target: 'Future milestone',
    summary: 'The product foundation is in place; operational tooling remains intentionally scoped for later.',
    completed: ['Source-controlled status metadata documents what is ready and what remains pending.'],
    inProgress: [],
    upcoming: [
      'Admin dashboards for campaign and donation oversight.',
      'Moderation queues and support workflows.',
      'Product analytics and health reporting.',
    ],
  },
]

export function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function getStatusBadgeClass(status: StatusState) {
  switch (status) {
    case 'completed':
      return 'border-primary/25 bg-primary/10 text-primary'
    case 'in-progress':
      return 'border-accent/60 bg-accent/40 text-foreground'
    case 'upcoming':
      return 'border-border bg-muted/60 text-muted-foreground'
    default:
      return 'border-border bg-muted/60 text-muted-foreground'
  }
}

export function getProgressBarClass(status: StatusState) {
  switch (status) {
    case 'completed':
      return 'bg-primary'
    case 'in-progress':
      return 'bg-accent'
    case 'upcoming':
      return 'bg-muted-foreground'
    default:
      return 'bg-primary'
  }
}

export function summarizeStatus(modules: StatusModule[]) {
  const safeModules = modules.length > 0 ? modules : projectStatusModules
  const counts = safeModules.reduce(
    (acc, module) => {
      acc[module.status] += 1
      return acc
    },
    { completed: 0, 'in-progress': 0, upcoming: 0 } as Record<StatusState, number>,
  )

  const overallProgress = clampProgress(
    safeModules.reduce((total, module) => total + clampProgress(module.progress), 0) / safeModules.length,
  )

  return {
    total: safeModules.length,
    overallProgress,
    counts,
  }
}

interface StatusSummaryProps {
  modules?: StatusModule[]
  compact?: boolean
  showCta?: boolean
  className?: string
}

export default function StatusSummary({
  modules = projectStatusModules,
  compact = false,
  showCta = false,
  className = '',
}: StatusSummaryProps) {
  const summary = summarizeStatus(modules)
  const progressLabel = `Overall Renderr product readiness: ${summary.overallProgress}% complete`
  const headingId = compact ? 'status-summary-dashboard-title' : 'status-summary-title'

  return (
    <Card className={`overflow-hidden border-primary/20 bg-card/90 shadow-sm backdrop-blur ${className}`}>
      <CardHeader className={compact ? 'space-y-3 p-5' : 'space-y-4 border-b border-border bg-muted/20 p-6'}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Is it done yet?
            </div>
            <CardTitle id={headingId} className={compact ? 'text-xl' : 'text-2xl sm:text-3xl'}>
              Renderr product status
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl">
              {summary.counts.completed} of {summary.total} modules are production-ready. Track what is complete, what is actively moving, and what is coming next.
            </CardDescription>
          </div>

          {showCta ? (
            <Button asChild variant="outline" className="w-full rounded-xl sm:w-auto">
              <Link to="/status">View full status</Link>
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className={compact ? 'space-y-5 p-5 pt-0' : 'space-y-6 p-6'}>
        <section aria-labelledby={`${headingId}-progress`} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 id={`${headingId}-progress`} className="text-sm font-semibold text-foreground">
              Overall readiness
            </h3>
            <p className="text-sm font-bold text-primary">{summary.overallProgress}%</p>
          </div>
          <div
            className="h-3 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label={progressLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={summary.overallProgress}
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${summary.overallProgress}%` }}
            />
          </div>
        </section>

        <section aria-labelledby={`${headingId}-counts`}>
          <h3 id={`${headingId}-counts`} className="sr-only">
            Module status counts
          </h3>
          <dl className="grid gap-3 sm:grid-cols-3">
            {(['completed', 'in-progress', 'upcoming'] as StatusState[]).map((status) => (
              <div key={status} className="rounded-2xl border border-border bg-background/70 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {STATUS_LABELS[status]}
                </dt>
                <dd className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-2xl font-black text-primary">{summary.counts[status]}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(status)}`}>
                    {STATUS_SHORT_LABELS[status]}
                  </span>
                </dd>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{STATUS_DESCRIPTIONS[status]}</p>
              </div>
            ))}
          </dl>
        </section>
      </CardContent>
    </Card>
  )
}

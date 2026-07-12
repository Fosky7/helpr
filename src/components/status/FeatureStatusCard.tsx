import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import StatusBadge, { type StatusBadgeValue } from '@/components/status/StatusBadge'
import type { RenderrFeatureStatus } from '@/lib/status'

type FeatureLink = {
  label?: string
  title?: string
  name?: string
  to?: string
  href?: string
  path?: string
  route?: string
  url?: string
}

type FeatureStatusLike = {
  id?: string
  title?: string
  name?: string
  module?: string
  description?: string
  summary?: string
  details?: string
  status?: RenderrFeatureStatus
  route?: string
  path?: string
  href?: string
  to?: string
  url?: string
  links?: FeatureLink[]
  routes?: FeatureLink[]
  completedItems?: string[]
  completeItems?: string[]
  handledItems?: string[]
  availableItems?: string[]
  highlights?: string[]
  nextSteps?: string[]
  pendingItems?: string[]
  upcomingItems?: string[]
  missingItems?: string[]
  notes?: string[]
} & Record<string, unknown>

interface FeatureStatusCardProps {
  feature: FeatureStatusLike
}

const statusCardTone: Record<RenderrFeatureStatus, string> = {
  complete: 'border-primary/25 bg-card/90 shadow-primary/10 hover:border-primary/40',
  partial: 'border-accent/70 bg-accent/15 shadow-accent/10 hover:border-accent',
  pending: 'border-border bg-card/75 shadow-primary/5 hover:border-secondary/40',
}

const statusPanelTone: Record<RenderrFeatureStatus, string> = {
  complete: 'border-primary/20 bg-primary/5',
  partial: 'border-accent/70 bg-accent/20',
  pending: 'border-dashed border-border bg-muted/35',
}

function getText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined
}

function getFirstString(feature: FeatureStatusLike, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = getText(feature[key])
    if (value) return value
  }

  return fallback
}

function getStringList(feature: FeatureStatusLike, keys: string[]) {
  for (const key of keys) {
    const value = feature[key]
    if (Array.isArray(value)) {
      const items = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      if (items.length > 0) return items
    }
  }

  return []
}

function normalizeLinks(feature: FeatureStatusLike) {
  const rawLinks = Array.isArray(feature.links)
    ? feature.links
    : Array.isArray(feature.routes)
      ? feature.routes
      : []

  const links = rawLinks
    .map((item) => {
      const href = item.to ?? item.href ?? item.path ?? item.route ?? item.url
      if (!href) return null

      return {
        href,
        label: item.label ?? item.title ?? item.name ?? href,
      }
    })
    .filter((item): item is { href: string; label: string } => Boolean(item))

  const singleHref = feature.to ?? feature.href ?? feature.path ?? feature.route ?? feature.url
  if (typeof singleHref === 'string' && singleHref.trim().length > 0 && !links.some((link) => link.href === singleHref)) {
    links.push({ href: singleHref, label: 'Open route' })
  }

  return links
}

function renderLink(href: string, label: string) {
  const className = 'inline-flex items-center justify-center rounded-xl border border-primary/20 bg-background/75 px-3 py-2 text-xs font-semibold text-primary shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
  const isExternal = /^https?:\/\//i.test(href)

  if (isExternal) {
    return (
      <a key={href} href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
        <span aria-hidden="true" className="ml-1">↗</span>
      </a>
    )
  }

  return (
    <Link key={href} to={href} className={className}>
      {label}
      <span aria-hidden="true" className="ml-1">→</span>
    </Link>
  )
}

export default function FeatureStatusCard({ feature }: FeatureStatusCardProps) {
  const status = feature.status ?? 'pending'
  const title = getFirstString(feature, ['title', 'name', 'module'], 'Renderr feature')
  const summary = getFirstString(feature, ['summary', 'description', 'details'], 'This feature is tracked in the current Renderr product status snapshot.')
  const details = getText(feature.details)
  const positiveItems = getStringList(feature, ['completedItems', 'completeItems', 'handledItems', 'availableItems', 'highlights'])
  const nextItems = getStringList(feature, ['nextSteps', 'pendingItems', 'upcomingItems', 'missingItems', 'notes'])
  const links = normalizeLinks(feature)
  const badgeStatus: StatusBadgeValue = status

  return (
    <Card className={`overflow-hidden rounded-3xl shadow-sm backdrop-blur transition-colors ${statusCardTone[status]}`}>
      <CardContent className="p-0">
        <article className="relative">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
          </div>

          <div className="relative z-10 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                {feature.module ? <p className="text-sm font-semibold text-primary">{feature.module}</p> : null}
                <h4 className="mt-1 text-xl font-bold tracking-tight text-foreground">{title}</h4>
              </div>
              <StatusBadge status={badgeStatus} />
            </div>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">{summary}</p>
            {details && details !== summary ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{details}</p> : null}

            {(positiveItems.length > 0 || nextItems.length > 0) ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className={`rounded-2xl border p-4 ${statusPanelTone[status]}`}>
                  <h5 className="text-sm font-bold text-foreground">Visible signal</h5>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    {(positiveItems.length > 0 ? positiveItems : ['Status label, border treatment, and progress language identify this state.']).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary ring-1 ring-primary/20" aria-hidden="true">
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-border bg-background/65 p-4">
                  <h5 className="text-sm font-bold text-foreground">Next check</h5>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    {(nextItems.length > 0 ? nextItems : ['Review this module in the current product-readiness snapshot.']).map((item) => (
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
            ) : null}

            {links.length > 0 ? (
              <div className="mt-5 border-t border-border pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Smoke-test links</p>
                <div className="flex flex-wrap gap-2">
                  {links.map((link) => renderLink(link.href, link.label))}
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </CardContent>
    </Card>
  )
}

export type RenderrFeatureStatus = 'complete' | 'partial' | 'pending'

export interface RenderrStatusLink {
  label: string
  href: string
}

export interface RenderrFeatureStatusItem {
  id: string
  module: string
  title: string
  status: RenderrFeatureStatus
  summary: string
  details: string[]
  links?: RenderrStatusLink[]
}

export const statusLabels: Record<RenderrFeatureStatus, string> = {
  complete: 'Complete',
  partial: 'Partially complete',
  pending: 'Pending',
}

export const statusDescriptions: Record<RenderrFeatureStatus, string> = {
  complete: 'Implemented and ready to use in the app today.',
  partial: 'Usable foundation is in place, with additional work still planned.',
  pending: 'Not shipped yet and still needs implementation.',
}

export const statusFeatures: RenderrFeatureStatusItem[] = [
  {
    id: 'auth',
    module: 'Module 1',
    title: 'Authentication and account access',
    status: 'complete',
    summary: 'Email/password signup, login, protected route gating, and sign-out are wired through the existing Supabase auth flow.',
    details: [
      'Public login and signup pages are available.',
      'Authenticated users are redirected into the dashboard.',
      'Protected dashboard, profile, and campaign routes remain behind the auth guard.',
    ],
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Create account', href: '/signup' },
    ],
  },
  {
    id: 'profile',
    module: 'Module 1',
    title: 'Profile settings',
    status: 'complete',
    summary: 'Signed-in users can view and update core profile details connected to their Renderr account.',
    details: [
      'Profile records are loaded from Supabase for the active user.',
      'Full name updates include clear loading and saving feedback.',
      'Profile access stays authenticated-only through the shared ProtectedRoute wrapper.',
    ],
    links: [{ label: 'Open profile', href: '/profile' }],
  },
  {
    id: 'campaign-management',
    module: 'Module 2',
    title: 'Campaign management workspace',
    status: 'complete',
    summary: 'Organizers can create drafts, edit campaigns, publish valid fundraisers, archive published campaigns, and delete drafts.',
    details: [
      'Campaign list and dashboard summary are available to signed-in organizers.',
      'Create and edit flows support draft and publish actions.',
      'Owner-only actions include archive for published campaigns and delete for drafts.',
    ],
    links: [
      { label: 'Manage campaigns', href: '/campaigns' },
      { label: 'Create campaign', href: '/campaigns/new' },
    ],
  },
  {
    id: 'public-fundraisers',
    module: 'Module 2',
    title: 'Public fundraiser browsing',
    status: 'complete',
    summary: 'Visitors can browse published fundraisers without signing in and search across campaign stories and metadata.',
    details: [
      'Only published campaigns are exposed on the public fundraiser listing.',
      'Public campaign detail routes are available by slug.',
      'Draft and archived campaigns remain private to organizers.',
    ],
    links: [{ label: 'Browse fundraisers', href: '/fundraisers' }],
  },
  {
    id: 'donations-payments',
    module: 'Module 3',
    title: 'Donations and payments',
    status: 'pending',
    summary: 'Donation checkout, payment processing, receipts, and donor-facing transaction flows have not shipped yet.',
    details: [
      'Published campaign pages are prepared for future donation support.',
      'Payment provider integration still needs secure server-side implementation.',
      'Donation records, confirmation states, and receipts are still pending.',
    ],
  },
  {
    id: 'admin-reporting',
    module: 'Module 4',
    title: 'Admin, reporting, and analytics',
    status: 'pending',
    summary: 'Operational dashboards, moderation tools, reporting views, and analytics workflows are still planned work.',
    details: [
      'Organizer campaign basics are available, but deeper reporting is not yet implemented.',
      'Platform-wide admin and moderation tooling still needs role-aware access control.',
      'Analytics dashboards and export workflows are not available yet.',
    ],
  },
  {
    id: 'status-page',
    module: 'Module 5',
    title: 'In-app product status page',
    status: 'complete',
    summary: 'This public status experience answers “Is it done yet?” with a clear module-by-module progress overview.',
    details: [
      'The /status route is public and does not require authentication.',
      'Reusable status cards and badges keep the progress UI consistent.',
      'Route links point visitors to available public and authenticated workflows.',
    ],
    links: [{ label: 'View status', href: '/status' }],
  },
]

export const statusSummary = statusFeatures.reduce(
  (summary, feature) => {
    summary.total += 1
    summary[feature.status] += 1
    return summary
  },
  {
    total: 0,
    complete: 0,
    partial: 0,
    pending: 0,
  } satisfies Record<RenderrFeatureStatus | 'total', number>,
)

export const completionScore = Math.round(
  ((statusSummary.complete + statusSummary.partial * 0.5) / Math.max(statusSummary.total, 1)) * 100,
)

export const currentStatusAnswer =
  statusSummary.pending > 0 || statusSummary.partial > 0
    ? 'Not fully done yet — the core Renderr foundation is usable, while donations, payments, and admin/reporting are still pending.'
    : 'Yes — all tracked Renderr modules are complete.'

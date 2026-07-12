import type {
  ProjectModuleStatus,
  ProjectStatusGroup,
  ProjectStatusModule,
  ProjectStatusSummary,
} from '@/types/projectStatus'

export const projectStatusModules = [
  {
    id: 'auth-foundation',
    title: 'Authentication and account foundation',
    module: 'Module 1',
    status: 'completed',
    health: 'production-ready',
    summary: 'Secure Supabase-backed signup, login, protected routing, and profile settings are implemented.',
    details:
      'Users can create an account, sign in, access authenticated pages, update profile details, and sign out through the Renderr interface.',
    completedItems: [
      'Email/password signup and login flows',
      'Protected dashboard and profile routes',
      'Supabase session handling through AuthContext',
      'Profile loading and update experience',
    ],
    nextSteps: [
      'Add end-to-end auth smoke tests',
      'Expand profile personalization with avatar upload',
    ],
    owner: 'Core product',
    updatedAt: '2026-07-11',
  },
  {
    id: 'campaign-management',
    title: 'Campaign management workspace',
    module: 'Module 2',
    status: 'completed',
    health: 'production-ready',
    summary: 'Campaign creation, editing, publishing, archiving, and owner dashboards are available.',
    details:
      'Authenticated organizers can manage fundraising campaigns from draft through published and archived states, while public visitors can browse published fundraisers.',
    completedItems: [
      'Owned campaign list and dashboard summary',
      'Campaign create and edit flows',
      'Publish, archive, and delete-draft actions',
      'Public fundraiser browse and detail pages',
    ],
    nextSteps: [
      'Add richer campaign media controls',
      'Introduce organizer analytics once donation data exists',
    ],
    owner: 'Fundraising product',
    updatedAt: '2026-07-11',
  },
  {
    id: 'status-experience',
    title: '“Is it done yet?” product status',
    module: 'Module 3',
    status: 'completed',
    health: 'production-ready',
    summary: 'A dedicated status page and dashboard entry point explain what is ready, active, and planned.',
    details:
      'Renderr now exposes source-controlled product status metadata that can later be migrated to Supabase records without changing the page contract.',
    completedItems: [
      'Typed project status metadata',
      'Dedicated protected /status route',
      'Dashboard links and readiness summary',
      'Completed, in-progress, and upcoming module grouping',
    ],
    nextSteps: [
      'Replace static metadata with Supabase-backed records if editorial updates need to move out of source control',
    ],
    owner: 'Core product',
    updatedAt: '2026-07-11',
  },
  {
    id: 'donations-payments',
    title: 'Donations and payments',
    module: 'Module 4',
    status: 'in-progress',
    health: 'active-build',
    summary: 'Donation collection is the next major fundraising capability and is not production-ready yet.',
    details:
      'The public campaign experience is ready to receive donation entry points, but payment provider wiring, transaction records, receipts, and reconciliation are still pending.',
    completedItems: [
      'Published campaign pages that can host donation calls to action',
      'Campaign goal and raised amount fields prepared for donation totals',
    ],
    nextSteps: [
      'Choose and wire payment provider flow',
      'Create donation database records and security policies',
      'Add receipts, confirmation states, and failed-payment recovery',
    ],
    owner: 'Payments product',
    updatedAt: '2026-07-11',
  },
  {
    id: 'admin-operations',
    title: 'Admin and operations dashboards',
    module: 'Module 5',
    status: 'upcoming',
    health: 'planned',
    summary: 'Administrative moderation, reporting, and platform operations tools are planned but not started.',
    details:
      'Renderr currently focuses on authenticated organizer workflows and public campaign discovery. Platform-level controls will follow after donations establish the core transaction model.',
    completedItems: [
      'Product surface areas identified for future operational oversight',
    ],
    nextSteps: [
      'Define admin roles and permissions',
      'Create moderation queues for campaigns and users',
      'Build reporting exports and platform health views',
    ],
    owner: 'Platform operations',
    updatedAt: '2026-07-11',
  },
] as const satisfies ProjectStatusModule[]

export const projectStatusLabels: Record<ProjectModuleStatus, string> = {
  completed: 'Done',
  'in-progress': 'In progress',
  upcoming: 'Upcoming',
}

export const projectStatusDescriptions: Record<ProjectModuleStatus, string> = {
  completed: 'Production-ready modules available in Renderr today.',
  'in-progress': 'Active work that is visible in the roadmap but not ready for production use yet.',
  upcoming: 'Planned capabilities that will follow after current build priorities land.',
}

export const projectStatusOrder: ProjectModuleStatus[] = ['completed', 'in-progress', 'upcoming']

export function getProjectStatusSummary(modules: readonly ProjectStatusModule[] = projectStatusModules): ProjectStatusSummary {
  const completed = modules.filter((module) => module.status === 'completed').length
  const inProgress = modules.filter((module) => module.status === 'in-progress').length
  const upcoming = modules.filter((module) => module.status === 'upcoming').length
  const total = modules.length

  return {
    total,
    completed,
    inProgress,
    upcoming,
    productionReadyPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

export function getProjectStatusGroups(modules: readonly ProjectStatusModule[] = projectStatusModules): ProjectStatusGroup[] {
  return projectStatusOrder.map((status) => ({
    status,
    label: projectStatusLabels[status],
    description: projectStatusDescriptions[status],
    modules: modules.filter((module) => module.status === status),
  }))
}

export function getProjectStatusUpdatedAt(modules: readonly ProjectStatusModule[] = projectStatusModules): string {
  return modules.reduce((latest, module) => (module.updatedAt > latest ? module.updatedAt : latest), modules[0]?.updatedAt ?? '')
}

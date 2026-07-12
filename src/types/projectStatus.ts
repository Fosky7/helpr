export type ProjectModuleStatus = 'completed' | 'in-progress' | 'upcoming'

export type ProjectStatusValue = 'done' | 'in_progress' | 'blocked' | 'planned'

export type ProjectStatusDisplayMeta = {
  label: string
  accessibleLabel: string
  description: string
}

export type ProjectStatusHealth = 'production-ready' | 'active-build' | 'planned'

export interface ProjectStatusModule {
  id: string
  title: string
  module: string
  status: ProjectModuleStatus
  health: ProjectStatusHealth
  summary: string
  details: string
  completedItems: string[]
  nextSteps: string[]
  owner: string
  updatedAt: string
}

export interface ProjectStatusSummary {
  total: number
  completed: number
  inProgress: number
  upcoming: number
  productionReadyPercentage: number
}

export interface ProjectStatusGroup {
  status: ProjectModuleStatus
  label: string
  description: string
  modules: ProjectStatusModule[]
}

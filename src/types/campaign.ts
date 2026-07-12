export const CAMPAIGN_STATUSES = ['draft', 'published', 'archived'] as const

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]

export const CAMPAIGN_TITLE_MAX_LENGTH = 120
export const CAMPAIGN_SUMMARY_MAX_LENGTH = 280
export const CAMPAIGN_STORY_MAX_LENGTH = 12000
export const CAMPAIGN_MIN_GOAL_CENTS = 100
export const CAMPAIGN_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_CAMPAIGN_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export type AcceptedCampaignImageMimeType = (typeof ACCEPTED_CAMPAIGN_IMAGE_MIME_TYPES)[number]

/**
 * Database representation of a fundraising campaign.
 * Keep field names in snake_case to match the Supabase table exactly.
 */
export interface Campaign {
  id: string
  owner_id: string
  title: string
  slug: string
  summary: string | null
  story: string
  goal_cents: number
  raised_cents: number
  status: CampaignStatus
  cover_image_url: string | null
  published_at: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Form state used by React components. Uses camelCase for ergonomic UI code.
 */
export interface CampaignFormValues {
  title: string
  slug: string
  summary: string
  story: string
  goalCents: number
  coverImageUrl: string
  coverImageFile: File | null
}

/**
 * Payload sent to the campaigns-api Edge Function.
 * Uses database-compatible snake_case keys so backend validation can map directly
 * to campaign columns. updateCampaign accepts Partial<CampaignMutationPayload>.
 */
export interface CampaignMutationPayload {
  title: string
  slug?: string | null
  summary?: string | null
  story: string
  goal_cents: number
  cover_image_url?: string | null
}

export interface CampaignListFilters {
  status?: CampaignStatus | 'all'
  ownerId?: string
  search?: string
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'updated_at' | 'published_at' | 'goal_cents' | 'raised_cents' | 'title'
  sortDirection?: 'asc' | 'desc'
}

export function isCampaignStatus(value: unknown): value is CampaignStatus {
  return typeof value === 'string' && (CAMPAIGN_STATUSES as readonly string[]).includes(value)
}

import { supabase } from '@/integrations/supabase/client'
import {
  ACCEPTED_CAMPAIGN_IMAGE_MIME_TYPES,
  CAMPAIGN_MAX_IMAGE_SIZE_BYTES,
  CAMPAIGN_MIN_GOAL_CENTS,
  CAMPAIGN_STORY_MAX_LENGTH,
  CAMPAIGN_SUMMARY_MAX_LENGTH,
  CAMPAIGN_TITLE_MAX_LENGTH,
  type Campaign,
  type CampaignListFilters,
  type CampaignMutationPayload,
  type CampaignStatus,
  isCampaignStatus,
} from '@/types/campaign'

const CAMPAIGNS_FUNCTION_NAME = 'campaigns-api'
const CAMPAIGN_MEDIA_BUCKET = 'campaign-media'
const DEFAULT_LIST_LIMIT = 50
const MAX_LIST_LIMIT = 100

const CAMPAIGN_SELECT = [
  'id',
  'owner_id',
  'title',
  'slug',
  'summary',
  'story',
  'goal_amount_cents',
  'amount_raised_cents',
  'currency',
  'cover_image_url',
  'status',
  'published_at',
  'archived_at',
  'created_at',
  'updated_at',
].join(',')

type UnknownRecord = Record<string, unknown>

type CampaignQueryResult<T> = {
  data: T | null
  error: { message?: string; code?: string; details?: string } | null
}

type CampaignResult<T> = {
  data: T | null
  error: string | null
}

export type { CampaignResult }

export type CampaignCoverUpload = {
  path: string
  publicUrl: string
}

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : null
}

function success<T>(data: T): CampaignResult<T> {
  return { data, error: null }
}

function failure<T>(error: unknown): CampaignResult<T> {
  return { data: null, error: normalizeCampaignError(error) }
}

function extractMessage(error: unknown): string {
  if (typeof error === 'string') return error
  const record = asRecord(error)
  if (!record) return ''

  const nestedError = record.error
  if (typeof nestedError === 'string') return nestedError
  if (asRecord(nestedError) && typeof asRecord(nestedError)?.message === 'string') {
    return asRecord(nestedError)?.message as string
  }

  if (typeof record.message === 'string') return record.message
  if (typeof record.details === 'string') return record.details
  return ''
}

export function normalizeCampaignError(error: unknown): string {
  const rawMessage = extractMessage(error)
  const message = rawMessage.toLowerCase()

  if (!rawMessage) return 'Something went wrong while working with campaigns. Please try again.'
  if (message.includes('failed to fetch') || message.includes('network') || message.includes('fetch')) {
    return 'Unable to reach the campaign service. Check your connection and try again.'
  }
  if (message.includes('jwt') || message.includes('session') || message.includes('not authenticated') || message.includes('authentication') || message.includes('unauthorized')) {
    return 'Please sign in again to continue managing campaigns.'
  }
  if (message.includes('permission') || message.includes('row-level security') || message.includes('rls') || message.includes('forbidden')) {
    return 'You do not have permission to perform this campaign action.'
  }
  if (message.includes('duplicate') || message.includes('unique') || message.includes('campaign URL') || message.includes('slug')) {
    return 'That campaign URL is already in use. Choose a different slug.'
  }
  if (message.includes('not found') || message.includes('pgrst116')) return 'We could not find that campaign.'
  if (message.includes('storage') || message.includes('bucket')) return 'Campaign media storage is unavailable. Please try again later.'
  if (message.includes('too large') || message.includes('size')) return 'That image is too large. Upload an image under 5 MB.'
  if (message.includes('mime') || message.includes('file type') || message.includes('unsupported')) {
    return 'Use a supported cover image format: JPG, PNG, WebP, or GIF.'
  }

  return rawMessage
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function normalizeCampaignRow(row: unknown): Campaign {
  const record = asRecord(row)
  if (!record) throw new Error('Invalid campaign response received from the server.')

  const statusValue = record.status
  const status: CampaignStatus = isCampaignStatus(statusValue) ? statusValue : 'draft'

  return {
    id: stringValue(record.id),
    owner_id: stringValue(record.owner_id),
    title: stringValue(record.title),
    slug: stringValue(record.slug),
    summary: nullableString(record.summary),
    story: stringValue(record.story),
    goal_cents: numberValue(record.goal_amount_cents ?? record.goal_cents),
    raised_cents: numberValue(record.amount_raised_cents ?? record.raised_cents),
    status,
    cover_image_url: nullableString(record.cover_image_url),
    published_at: nullableString(record.published_at),
    archived_at: nullableString(record.archived_at),
    created_at: stringValue(record.created_at),
    updated_at: stringValue(record.updated_at),
  }
}

function normalizeCampaignRows(rows: unknown): Campaign[] {
  return Array.isArray(rows) ? rows.map(normalizeCampaignRow) : []
}

function sanitizeLimit(limit?: number): number {
  if (!Number.isFinite(limit)) return DEFAULT_LIST_LIMIT
  return Math.min(Math.max(Math.trunc(limit ?? DEFAULT_LIST_LIMIT), 1), MAX_LIST_LIMIT)
}

function sanitizeOffset(offset?: number): number {
  if (!Number.isFinite(offset)) return 0
  return Math.max(Math.trunc(offset ?? 0), 0)
}

function applyListFilters(query: any, filters: CampaignListFilters = {}) {
  let nextQuery = query

  if (filters.status && filters.status !== 'all') nextQuery = nextQuery.eq('status', filters.status)

  const search = filters.search?.trim()
  if (search) {
    const safeSearch = search.replace(/[,()%]/g, ' ')
    nextQuery = nextQuery.or(`title.ilike.%${safeSearch}%,summary.ilike.%${safeSearch}%`)
  }

  const sortByMap: Record<string, string> = {
    created_at: 'created_at',
    updated_at: 'updated_at',
    published_at: 'published_at',
    goal_cents: 'goal_amount_cents',
    raised_cents: 'amount_raised_cents',
    title: 'title',
  }
  const sortBy = sortByMap[filters.sortBy ?? 'updated_at'] ?? 'updated_at'
  nextQuery = nextQuery.order(sortBy, { ascending: filters.sortDirection === 'asc', nullsFirst: false })

  const limit = sanitizeLimit(filters.limit)
  const offset = sanitizeOffset(filters.offset)
  return nextQuery.range(offset, offset + limit - 1)
}

function validateImage(file: File): string | null {
  if (!(ACCEPTED_CAMPAIGN_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'Use a supported cover image format: JPG, PNG, WebP, or GIF.'
  }
  if (file.size > CAMPAIGN_MAX_IMAGE_SIZE_BYTES) return 'That image is too large. Upload an image under 5 MB.'
  return null
}

function extensionForFile(file: File): string {
  const byName = file.name.split('.').pop()?.toLowerCase()
  if (byName && /^[a-z0-9]+$/.test(byName)) return byName

  switch (file.type) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return 'bin'
  }
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function cleanPayload<T extends Partial<CampaignMutationPayload>>(payload: T): T {
  const cleaned: Partial<CampaignMutationPayload> = { ...payload }

  if (typeof cleaned.title === 'string') cleaned.title = cleaned.title.trim()
  if (typeof cleaned.slug === 'string') cleaned.slug = cleaned.slug.trim().toLowerCase() || null
  if (typeof cleaned.summary === 'string') cleaned.summary = cleaned.summary.trim() || null
  if (typeof cleaned.story === 'string') cleaned.story = cleaned.story.trim()
  if (typeof cleaned.cover_image_url === 'string') cleaned.cover_image_url = cleaned.cover_image_url.trim() || null

  return cleaned as T
}

function validatePayload(payload: Partial<CampaignMutationPayload>, options: { partial: boolean }): string | null {
  if (!options.partial || payload.title !== undefined) {
    if (!payload.title?.trim()) return 'Campaign title is required.'
    if (payload.title.trim().length > CAMPAIGN_TITLE_MAX_LENGTH) return `Campaign title must be ${CAMPAIGN_TITLE_MAX_LENGTH} characters or fewer.`
  }

  if (payload.summary !== undefined && payload.summary !== null && payload.summary.length > CAMPAIGN_SUMMARY_MAX_LENGTH) {
    return `Campaign summary must be ${CAMPAIGN_SUMMARY_MAX_LENGTH} characters or fewer.`
  }

  if (!options.partial || payload.story !== undefined) {
    if (!payload.story?.trim()) return 'Campaign story is required.'
    if (payload.story.trim().length > CAMPAIGN_STORY_MAX_LENGTH) return `Campaign story must be ${CAMPAIGN_STORY_MAX_LENGTH} characters or fewer.`
  }

  if (!options.partial || payload.goal_cents !== undefined) {
    if (!Number.isInteger(payload.goal_cents)) return 'Campaign goal must be a whole cent amount.'
    if ((payload.goal_cents ?? 0) < CAMPAIGN_MIN_GOAL_CENTS) return 'Campaign goal must be at least $1.00.'
  }

  return null
}

async function invokeCampaignFunction(body: Record<string, unknown>): Promise<CampaignResult<UnknownRecord>> {
  try {
    const { data, error } = await supabase.functions.invoke<{ data?: unknown; error?: unknown }>(CAMPAIGNS_FUNCTION_NAME, { body })
    if (error) return failure(error)
    if (data?.error) return failure(data.error)
    return success((asRecord(data?.data) ?? asRecord(data) ?? {}) as UnknownRecord)
  } catch (error) {
    return failure(error)
  }
}

function extractCampaignFromResponse(response: unknown): CampaignResult<Campaign> {
  try {
    return success(normalizeCampaignRow(response))
  } catch (error) {
    return failure(error)
  }
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function listMyCampaigns(userId: string, filters: CampaignListFilters = {}): Promise<CampaignResult<Campaign[]>> {
  if (!userId) return failure('Please sign in to view your campaigns.')

  try {
    const query = (supabase as any).from('campaigns').select(CAMPAIGN_SELECT).eq('owner_id', userId)
    const { data, error } = (await applyListFilters(query, filters)) as CampaignQueryResult<unknown[]>
    if (error) return failure(error)
    return success(normalizeCampaignRows(data))
  } catch (error) {
    return failure(error)
  }
}

export async function getOwnedCampaign(id: string): Promise<CampaignResult<Campaign>> {
  if (!id) return failure('Campaign ID is required.')

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) return failure('Please sign in to continue managing campaigns.')

    const { data, error } = (await (supabase as any)
      .from('campaigns')
      .select(CAMPAIGN_SELECT)
      .eq('id', id)
      .maybeSingle()) as CampaignQueryResult<unknown>

    if (error) return failure(error)
    if (!data) return failure('Campaign not found.')

    const campaign = normalizeCampaignRow(data)
    if (campaign.owner_id !== currentUserId) return failure('Campaign not found.')

    return success(campaign)
  } catch (error) {
    return failure(error)
  }
}

export async function listPublishedCampaigns(filters: CampaignListFilters = {}): Promise<CampaignResult<Campaign[]>> {
  try {
    const query = (supabase as any).from('campaigns').select(CAMPAIGN_SELECT).eq('status', 'published')
    const { data, error } = (await applyListFilters(query, {
      ...filters,
      status: 'published',
      sortBy: filters.sortBy ?? 'published_at',
      sortDirection: filters.sortDirection ?? 'desc',
    })) as CampaignQueryResult<unknown[]>

    if (error) return failure(error)
    return success(normalizeCampaignRows(data))
  } catch (error) {
    return failure(error)
  }
}

export async function getPublishedCampaignBySlug(slug: string): Promise<CampaignResult<Campaign>> {
  const normalizedSlug = slug.trim().toLowerCase()
  if (!normalizedSlug) return failure('Campaign slug is required.')

  try {
    const { data, error } = (await (supabase as any)
      .from('campaigns')
      .select(CAMPAIGN_SELECT)
      .eq('slug', normalizedSlug)
      .eq('status', 'published')
      .maybeSingle()) as CampaignQueryResult<unknown>

    if (error) return failure(error)
    if (!data) return failure('Campaign not found.')
    return success(normalizeCampaignRow(data))
  } catch (error) {
    return failure(error)
  }
}

export async function uploadCampaignCover(userId: string, file: File): Promise<CampaignResult<CampaignCoverUpload>> {
  if (!userId) return failure('Please sign in before uploading campaign media.')

  const validationError = validateImage(file)
  if (validationError) return failure(validationError)

  const path = `${userId}/covers/${randomId()}.${extensionForFile(file)}`

  try {
    const bucket = supabase.storage.from(CAMPAIGN_MEDIA_BUCKET)
    const { error } = await bucket.upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

    if (error) return failure(error)

    const { data } = bucket.getPublicUrl(path)
    if (!data.publicUrl) return failure('Unable to create a public URL for the campaign image.')

    return success({ path, publicUrl: data.publicUrl })
  } catch (error) {
    return failure(error)
  }
}

export async function createCampaign(payload: CampaignMutationPayload): Promise<CampaignResult<Campaign>> {
  const cleanedPayload = cleanPayload(payload)
  const validationError = validatePayload(cleanedPayload, { partial: false })
  if (validationError) return failure(validationError)

  const result = await invokeCampaignFunction({ action: 'create', payload: cleanedPayload })
  if (result.error || !result.data) return { data: null, error: result.error }
  return extractCampaignFromResponse(result.data)
}

export async function updateCampaign(id: string, payload: Partial<CampaignMutationPayload>): Promise<CampaignResult<Campaign>> {
  if (!id) return failure('Campaign ID is required.')

  const cleanedPayload = cleanPayload(payload)
  const validationError = validatePayload(cleanedPayload, { partial: true })
  if (validationError) return failure(validationError)
  if (Object.keys(cleanedPayload).length === 0) return failure('No campaign changes were provided.')

  const result = await invokeCampaignFunction({ action: 'update', id, payload: cleanedPayload })
  if (result.error || !result.data) return { data: null, error: result.error }
  return extractCampaignFromResponse(result.data)
}

export async function publishCampaign(id: string): Promise<CampaignResult<Campaign>> {
  if (!id) return failure('Campaign ID is required.')

  const result = await invokeCampaignFunction({ action: 'publish', id })
  if (result.error || !result.data) return { data: null, error: result.error }
  return extractCampaignFromResponse(result.data)
}

export async function archiveCampaign(id: string): Promise<CampaignResult<Campaign>> {
  if (!id) return failure('Campaign ID is required.')

  const result = await invokeCampaignFunction({ action: 'archive', id })
  if (result.error || !result.data) return { data: null, error: result.error }
  return extractCampaignFromResponse(result.data)
}

export async function deleteDraftCampaign(id: string): Promise<CampaignResult<{ id: string }>> {
  if (!id) return failure('Campaign ID is required.')

  const result = await invokeCampaignFunction({ action: 'delete', id })
  if (result.error || !result.data) return { data: null, error: result.error }

  const deletedId = typeof result.data.id === 'string' ? result.data.id : id
  return success({ id: deletedId })
}

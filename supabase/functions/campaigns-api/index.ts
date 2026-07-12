import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
}

const LIMITS = {
  titleMaxLength: 120,
  summaryMaxLength: 280,
  storyMaxLength: 12_000,
  categoryMaxLength: 80,
  locationMaxLength: 120,
  slugMaxLength: 90,
  imageUrlMaxLength: 2_048,
  minGoalCents: 100,
  maxGoalCents: 100_000_000_000,
} as const

type SupabaseAdminClient = ReturnType<typeof createClient>
type Action = 'create' | 'update' | 'publish' | 'archive' | 'delete' | 'deleteDraft' | 'delete-draft'
type CampaignStatus = 'draft' | 'published' | 'archived' | 'ended'

type CampaignRecord = {
  id: string
  owner_id: string
  title: string | null
  slug: string | null
  summary: string | null
  story: string | null
  category: string | null
  location: string | null
  goal_amount_cents: number | null
  amount_raised_cents: number
  currency: string
  cover_image_url: string | null
  status: CampaignStatus
  starts_at: string | null
  ends_at: string | null
  published_at: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

class ApiError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return jsonResponse({ data: null, error: null }, 200)
  }

  if (req.method !== 'POST') {
    return jsonResponse({ data: null, error: 'Method not allowed.' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new ApiError('Campaign service is not configured.', 500)
    }

    const authorization = req.headers.get('Authorization') ?? ''
    if (!authorization.toLowerCase().startsWith('bearer ')) {
      throw new ApiError('Authentication is required.', 401)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
      throw new ApiError('Invalid or expired session.', 401)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const body = await parseJsonBody(req)
    const action = readAction(body.action)
    const payload = getPayload(body)

    if (action === 'create') {
      const values = await buildCreateValues(adminClient, payload, user.id)
      const { data, error } = await adminClient.from('campaigns').insert(values).select('*').single()
      if (error) throw new ApiError(error.message, 400)
      return jsonResponse({ data, error: null })
    }

    const campaignId = getCampaignId(body)
    const campaign = await getOwnedCampaign(adminClient, campaignId, user.id)

    if (action === 'update') {
      ensureEditable(campaign)
      const values = await buildUpdateValues(adminClient, payload, campaign)
      if (Object.keys(values).length === 0) return jsonResponse({ data: campaign, error: null })

      const { data, error } = await adminClient
        .from('campaigns')
        .update(values)
        .eq('id', campaign.id)
        .select('*')
        .single()

      if (error) throw new ApiError(error.message, 400)
      return jsonResponse({ data, error: null })
    }

    if (action === 'publish') {
      ensureEditable(campaign)
      const draftUpdates = Object.keys(payload).length > 0 ? await buildUpdateValues(adminClient, payload, campaign) : {}
      const candidate = { ...campaign, ...draftUpdates } as CampaignRecord & Record<string, unknown>

      if (!candidate.slug) {
        const generatedSlug = await generateUniqueSlug(adminClient, stringValue(candidate.title) || 'fundraiser', campaign.id)
        candidate.slug = generatedSlug
        draftUpdates.slug = generatedSlug
      }

      if (!candidate.ends_at) {
        // Earlier frontend build steps validate an end date but did not always
        // include it in the mutation payload. Store a safe default so the DB
        // lifecycle constraint still protects published rows from NULL dates.
        const fallbackEndDate = new Date()
        fallbackEndDate.setDate(fallbackEndDate.getDate() + 30)
        candidate.ends_at = fallbackEndDate.toISOString()
        draftUpdates.ends_at = candidate.ends_at
      }

      validatePublishRequirements(candidate)

      const now = new Date().toISOString()
      const { data, error } = await adminClient
        .from('campaigns')
        .update({
          ...draftUpdates,
          status: 'published',
          published_at: campaign.published_at ?? now,
          archived_at: null,
          updated_at: now,
        })
        .eq('id', campaign.id)
        .select('*')
        .single()

      if (error) throw new ApiError(error.message, 400)
      return jsonResponse({ data, error: null })
    }

    if (action === 'archive') {
      if (campaign.status === 'archived') return jsonResponse({ data: campaign, error: null })

      const now = new Date().toISOString()
      const { data, error } = await adminClient
        .from('campaigns')
        .update({ status: 'archived', archived_at: now, updated_at: now })
        .eq('id', campaign.id)
        .select('*')
        .single()

      if (error) throw new ApiError(error.message, 400)
      return jsonResponse({ data, error: null })
    }

    if (action === 'delete' || action === 'deleteDraft' || action === 'delete-draft') {
      if (campaign.status !== 'draft') {
        throw new ApiError('Only draft campaigns can be deleted. Archive published campaigns instead.', 409)
      }

      const { error } = await adminClient.from('campaigns').delete().eq('id', campaign.id)
      if (error) throw new ApiError(error.message, 400)
      return jsonResponse({ data: { id: campaign.id, deleted: true }, error: null })
    }

    throw new ApiError('Unsupported campaign action.')
  } catch (error) {
    const apiError = error instanceof ApiError ? error : new ApiError('Unexpected campaign service error.', 500)
    return jsonResponse({ data: null, error: apiError.message }, apiError.status)
  }
})

function jsonResponse(payload: { data: unknown; error: string | null }, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function parseJsonBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const value = await req.json()
    if (!isRecord(value)) throw new ApiError('Request body must be a JSON object.')
    return value
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('Invalid JSON request body.')
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getPayload(body: Record<string, unknown>): Record<string, unknown> {
  return isRecord(body.payload) ? body.payload : body
}

function readAction(value: unknown): Action {
  if (
    value === 'create' ||
    value === 'update' ||
    value === 'publish' ||
    value === 'archive' ||
    value === 'delete' ||
    value === 'deleteDraft' ||
    value === 'delete-draft'
  ) {
    return value
  }

  throw new ApiError('A valid campaign action is required.')
}

function getCampaignId(body: Record<string, unknown>): string {
  const id = body.id ?? body.campaignId ?? body.campaign_id
  if (typeof id !== 'string' || !id.trim()) throw new ApiError('Campaign id is required.')
  return id.trim()
}

async function getOwnedCampaign(client: SupabaseAdminClient, id: string, userId: string): Promise<CampaignRecord> {
  const { data, error } = await client.from('campaigns').select('*').eq('id', id).maybeSingle()
  if (error) throw new ApiError(error.message, 400)
  if (!data) throw new ApiError('Campaign not found.', 404)

  const campaign = data as CampaignRecord
  if (campaign.owner_id !== userId) {
    throw new ApiError('You do not have permission to modify this campaign.', 403)
  }

  return campaign
}

function ensureEditable(campaign: CampaignRecord): void {
  if (campaign.status === 'archived') {
    throw new ApiError('Archived campaigns cannot be edited.', 409)
  }
}

async function buildCreateValues(
  client: SupabaseAdminClient,
  payload: Record<string, unknown>,
  userId: string,
): Promise<Record<string, unknown>> {
  const title = readText(payload.title, 'Title', LIMITS.titleMaxLength, { defaultValue: 'Untitled campaign' })
  const story = readText(payload.story ?? payload.description, 'Campaign story', LIMITS.storyMaxLength, {
    defaultValue: 'Draft story pending.',
  })
  const summary = readText(payload.summary, 'Summary', LIMITS.summaryMaxLength, { nullable: true })
  const category = readText(payload.category, 'Category', LIMITS.categoryMaxLength, { nullable: true })
  const location = readText(payload.location, 'Location', LIMITS.locationMaxLength, { nullable: true })
  const goalAmountCents = readGoalCents(payload, false) ?? LIMITS.minGoalCents
  const currency = readCurrency(payload.currency)
  const coverImageUrl = readImageUrl(payload.cover_image_url ?? payload.imageUrl ?? payload.image_url)
  const startsAt = readDate(payload.starts_at ?? payload.startsAt, 'Start date', { nullable: true })
  const endsAt = readDate(payload.ends_at ?? payload.endsAt ?? payload.end_date, 'End date', { nullable: true })
  const requestedSlug = readText(payload.slug, 'Slug', LIMITS.slugMaxLength, { nullable: true })
  const slug = requestedSlug ? await ensureUniqueSlug(client, normalizeSlug(requestedSlug)) : await generateUniqueSlug(client, title)

  return {
    owner_id: userId,
    title,
    slug,
    summary,
    story,
    category,
    location,
    goal_amount_cents: goalAmountCents,
    currency,
    cover_image_url: coverImageUrl,
    starts_at: startsAt,
    ends_at: endsAt,
    status: 'draft',
    published_at: null,
    archived_at: null,
  }
}

async function buildUpdateValues(
  client: SupabaseAdminClient,
  payload: Record<string, unknown>,
  current: CampaignRecord,
): Promise<Record<string, unknown>> {
  const values: Record<string, unknown> = {}

  if ('title' in payload) values.title = readText(payload.title, 'Title', LIMITS.titleMaxLength, { required: true })
  if ('story' in payload || 'description' in payload) {
    values.story = readText(payload.story ?? payload.description, 'Campaign story', LIMITS.storyMaxLength, { required: true })
  }
  if ('summary' in payload) values.summary = readText(payload.summary, 'Summary', LIMITS.summaryMaxLength, { nullable: true })
  if ('category' in payload) values.category = readText(payload.category, 'Category', LIMITS.categoryMaxLength, { nullable: true })
  if ('location' in payload) values.location = readText(payload.location, 'Location', LIMITS.locationMaxLength, { nullable: true })
  if ('currency' in payload) values.currency = readCurrency(payload.currency)
  if ('cover_image_url' in payload || 'imageUrl' in payload || 'image_url' in payload) {
    values.cover_image_url = readImageUrl(payload.cover_image_url ?? payload.imageUrl ?? payload.image_url)
  }
  if ('starts_at' in payload || 'startsAt' in payload) {
    values.starts_at = readDate(payload.starts_at ?? payload.startsAt, 'Start date', { nullable: true })
  }
  if ('ends_at' in payload || 'endsAt' in payload || 'end_date' in payload) {
    values.ends_at = readDate(payload.ends_at ?? payload.endsAt ?? payload.end_date, 'End date', { nullable: true })
  }
  if ('goal_cents' in payload || 'goal_amount_cents' in payload || 'goalCents' in payload || 'goal_dollars' in payload || 'goalDollars' in payload) {
    values.goal_amount_cents = readGoalCents(payload, true)
  }
  if ('slug' in payload) {
    const slug = readText(payload.slug, 'Slug', LIMITS.slugMaxLength, { required: true })
    values.slug = await ensureUniqueSlug(client, normalizeSlug(slug), current.id)
  }

  return values
}

function readText(
  value: unknown,
  label: string,
  maxLength: number,
  options: { required?: boolean; nullable?: boolean; defaultValue?: string } = {},
): string | null {
  if (value === undefined || value === null) {
    if (options.required) throw new ApiError(`${label} is required.`)
    return options.nullable ? null : options.defaultValue ?? ''
  }

  if (typeof value !== 'string') throw new ApiError(`${label} must be text.`)

  const trimmed = value.trim()
  if (!trimmed) {
    if (options.required) throw new ApiError(`${label} is required.`)
    return options.nullable ? null : options.defaultValue ?? ''
  }

  if (trimmed.length > maxLength) throw new ApiError(`${label} must be ${maxLength} characters or fewer.`)
  return trimmed
}

function readGoalCents(payload: Record<string, unknown>, required: boolean): number | null {
  const centsValue = payload.goal_cents ?? payload.goal_amount_cents ?? payload.goalCents
  const dollarsValue = payload.goal_dollars ?? payload.goalDollars
  let cents: number | null = null

  if (typeof centsValue === 'number') cents = Math.round(centsValue)
  else if (typeof centsValue === 'string' && centsValue.trim()) cents = Math.round(Number(centsValue))
  else if (typeof dollarsValue === 'number') cents = Math.round(dollarsValue * 100)
  else if (typeof dollarsValue === 'string' && dollarsValue.trim()) cents = Math.round(Number(dollarsValue) * 100)

  if (cents === null) {
    if (required) throw new ApiError('Goal amount is required.')
    return null
  }

  if (!Number.isFinite(cents)) throw new ApiError('Goal amount must be a valid number.')
  if (cents < LIMITS.minGoalCents) throw new ApiError('Goal amount must be at least $1.00.')
  if (cents > LIMITS.maxGoalCents) throw new ApiError('Goal amount is too large.')

  return cents
}

function readCurrency(value: unknown): string {
  if (value === undefined || value === null || value === '') return 'USD'
  if (typeof value !== 'string') throw new ApiError('Currency must be a 3-letter code.')

  const currency = value.trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(currency)) throw new ApiError('Currency must be a 3-letter code.')
  return currency
}

function readImageUrl(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') throw new ApiError('Image URL must be text.')

  const imageUrl = value.trim()
  if (!imageUrl) return null
  if (imageUrl.length > LIMITS.imageUrlMaxLength) throw new ApiError('Image URL is too long.')

  try {
    const parsed = new URL(imageUrl)
    if (parsed.protocol !== 'https:') throw new ApiError('Image URL must use HTTPS.')
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('Image URL must be valid.')
  }

  return imageUrl
}

function readDate(value: unknown, label: string, options: { nullable?: boolean } = {}): string | null {
  if (value === undefined || value === null || value === '') return options.nullable ? null : null
  if (typeof value !== 'string') throw new ApiError(`${label} must be a valid date.`)

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new ApiError(`${label} must be a valid date.`)
  return date.toISOString()
}

function validatePublishRequirements(campaign: Partial<CampaignRecord> & Record<string, unknown>): void {
  if (!stringValue(campaign.title)) throw new ApiError('A title is required before publishing.')
  if (!stringValue(campaign.story)) throw new ApiError('A campaign story is required before publishing.')
  if (!stringValue(campaign.slug)) throw new ApiError('A public URL slug is required before publishing.')
  if (!stringValue(campaign.currency)) throw new ApiError('A currency is required before publishing.')

  const goal = typeof campaign.goal_amount_cents === 'number' ? campaign.goal_amount_cents : Number(campaign.goal_amount_cents)
  if (!Number.isFinite(goal) || goal < LIMITS.minGoalCents) {
    throw new ApiError('A valid fundraising goal is required before publishing.')
  }

  if (!stringValue(campaign.ends_at)) throw new ApiError('An end date is required before publishing.')

  const endDate = new Date(stringValue(campaign.ends_at))
  if (Number.isNaN(endDate.getTime()) || endDate <= new Date()) {
    throw new ApiError('End date must be in the future before publishing.')
  }
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeSlug(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!slug) throw new ApiError('Slug must contain at least one letter or number.')
  if (slug.length > LIMITS.slugMaxLength) throw new ApiError(`Slug must be ${LIMITS.slugMaxLength} characters or fewer.`)
  return slug
}

async function generateUniqueSlug(client: SupabaseAdminClient, title: string, excludeId?: string): Promise<string> {
  return ensureUniqueSlug(client, normalizeSlug(title || 'fundraiser'), excludeId)
}

async function ensureUniqueSlug(client: SupabaseAdminClient, baseSlug: string, excludeId?: string): Promise<string> {
  const base = normalizeSlug(baseSlug).slice(0, LIMITS.slugMaxLength)

  for (let attempt = 0; attempt < 75; attempt += 1) {
    const suffix = attempt === 0 ? '' : `-${attempt + 1}`
    const candidate = `${base.slice(0, LIMITS.slugMaxLength - suffix.length)}${suffix}`
    const { data, error } = await client.from('campaigns').select('id').eq('slug', candidate).limit(1).maybeSingle()

    if (error) throw new ApiError(error.message, 400)
    if (!data || (excludeId && (data as { id?: string }).id === excludeId)) return candidate
  }

  throw new ApiError('Unable to generate a unique campaign URL. Please choose another slug.')
}

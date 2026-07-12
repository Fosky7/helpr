import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import ColorfulSectionHeader from '@/components/layout/ColorfulSectionHeader'
import CampaignForm, { type CampaignFormValues } from '@/components/campaigns/CampaignForm'
import CampaignStatusBadge, { type CampaignStatus } from '@/components/campaigns/CampaignStatusBadge'
import type { ManagedCampaign } from '@/components/campaigns/CampaignCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function toFormValues(campaign: ManagedCampaign): CampaignFormValues {
  return {
    title: campaign.title || '',
    slug: campaign.slug || '',
    description: campaign.description || '',
    story: campaign.story || '',
    goal_amount: campaign.goal_amount ? String(campaign.goal_amount) : '',
    cover_image_url: campaign.cover_image_url || '',
  }
}

export default function CampaignEdit() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const mountedRef = useRef(true)
  const [campaign, setCampaign] = useState<ManagedCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [actionBusy, setActionBusy] = useState<CampaignStatus | null>(null)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadCampaign = useCallback(async () => {
    if (!id || !user?.id) return

    setLoading(true)
    setApiError('')

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!mountedRef.current) return

    if (error) {
      setApiError(error.message)
      setCampaign(null)
    } else {
      setCampaign(data as ManagedCampaign)
    }

    setLoading(false)
  }, [id, user?.id])

  useEffect(() => {
    loadCampaign()
  }, [loadCampaign])

  const handleSubmit = async (values: CampaignFormValues) => {
    if (!id || !user?.id) return

    setSubmitting(true)
    setApiError('')

    const { error } = await supabase
      .from('campaigns')
      .update({
        title: values.title,
        slug: values.slug,
        description: values.description,
        story: values.story,
        goal_amount: Number(values.goal_amount),
        cover_image_url: values.cover_image_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (!mountedRef.current) return

    setSubmitting(false)

    if (error) {
      setApiError(error.message)
      toast.error(error.message)
      return
    }

    toast.success('Campaign updated!')
    loadCampaign()
  }

  const updateStatus = async (status: CampaignStatus) => {
    if (!id || !user?.id || !campaign) return

    setActionBusy(status)
    setApiError('')

    const now = new Date().toISOString()
    const payload = {
      status,
      updated_at: now,
      ...(status === 'published' ? { published_at: campaign.published_at || now, archived_at: null } : {}),
      ...(status === 'archived' ? { archived_at: now } : {}),
    }

    const { error } = await supabase
      .from('campaigns')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)

    if (!mountedRef.current) return

    setActionBusy(null)

    if (error) {
      setApiError(error.message)
      toast.error(error.message)
      return
    }

    toast.success(status === 'published' ? 'Campaign published!' : 'Campaign archived.')
    loadCampaign()
  }

  if (loading) {
    return (
      <AppShell centered maxWidthClassName="max-w-md" aria-label="Loading campaign">
        <Card className="border-primary/20 bg-card/90 text-center shadow-xl shadow-primary/10 backdrop-blur">
          <CardContent className="p-8 text-sm text-muted-foreground" aria-busy="true">
            Loading campaign editor...
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  if (!campaign) {
    return (
      <AppShell centered maxWidthClassName="max-w-md" aria-label="Campaign not found">
        <Card className="border-destructive/40 bg-card/90 text-center shadow-xl shadow-primary/10 backdrop-blur">
          <CardContent className="space-y-4 p-8">
            <BrandMark compact size="lg" className="justify-center" />
            <h1 className="text-2xl font-bold tracking-tight">Campaign not found</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {apiError || 'This campaign could not be loaded or you do not have access to edit it.'}
            </p>
            <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
              <Link to="/campaigns">Back to campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  const isPublished = campaign.status === 'published'
  const isArchived = campaign.status === 'archived'

  return (
    <AppShell maxWidthClassName="max-w-5xl" aria-label="Edit campaign">
      <div className="space-y-6">
        <nav className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-card/85 p-5 shadow-xl shadow-primary/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between" aria-label="Edit campaign navigation">
          <Link to="/campaigns" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <BrandMark subtitle="Edit campaign" />
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="rounded-xl bg-background/70">
              <Link to="/campaigns">Back to campaigns</Link>
            </Button>
            {isPublished && campaign.slug ? (
              <Button asChild variant="outline" className="rounded-xl bg-background/70">
                <Link to={`/fundraisers/${campaign.slug}`}>View public page</Link>
              </Button>
            ) : null}
          </div>
        </nav>

        <ColorfulSectionHeader
          eyebrow="Campaign editor"
          title={campaign.title || 'Untitled campaign'}
          description="Refine the campaign story, goal, and public details. Publish when it is ready or archive it when the fundraiser is complete."
          headingLevel={1}
          actions={<CampaignStatusBadge status={campaign.status} />}
        />

        <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
          <CampaignForm
            mode="edit"
            key={campaign.id + campaign.updated_at}
            initialValues={toFormValues(campaign)}
            status={campaign.status}
            submitting={submitting || Boolean(actionBusy)}
            apiError={apiError}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/campaigns')}
            footerActions={
              <>
                {!isPublished && !isArchived ? (
                  <Button type="button" variant="outline" className="rounded-xl bg-background/70" disabled={submitting || Boolean(actionBusy)} onClick={() => updateStatus('published')} aria-busy={actionBusy === 'published'}>
                    {actionBusy === 'published' ? 'Publishing...' : 'Publish'}
                  </Button>
                ) : null}
                {!isArchived ? (
                  <Button type="button" variant="outline" className="rounded-xl bg-background/70" disabled={submitting || Boolean(actionBusy)} onClick={() => updateStatus('archived')} aria-busy={actionBusy === 'archived'}>
                    {actionBusy === 'archived' ? 'Archiving...' : 'Archive'}
                  </Button>
                ) : null}
              </>
            }
          />
        </Card>
      </div>
    </AppShell>
  )
}

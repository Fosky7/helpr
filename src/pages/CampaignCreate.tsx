import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import ColorfulSectionHeader from '@/components/layout/ColorfulSectionHeader'
import CampaignForm, { type CampaignFormValues } from '@/components/campaigns/CampaignForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function CampaignCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const mountedRef = useRef(true)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleSubmit = async (values: CampaignFormValues) => {
    if (!user?.id) {
      setApiError('You must be signed in to create a campaign.')
      return
    }

    setSubmitting(true)
    setApiError('')

    const now = new Date().toISOString()
    const payload = {
      user_id: user.id,
      title: values.title,
      slug: values.slug,
      description: values.description,
      story: values.story,
      goal_amount: Number(values.goal_amount),
      cover_image_url: values.cover_image_url || null,
      status: 'draft',
      current_amount: 0,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert(payload)
      .select('id')
      .single()

    if (!mountedRef.current) return

    setSubmitting(false)

    if (error) {
      setApiError(error.message)
      toast.error(error.message)
      return
    }

    toast.success('Campaign draft created!')
    navigate(data?.id ? `/campaigns/${data.id}/edit` : '/campaigns')
  }

  return (
    <AppShell maxWidthClassName="max-w-5xl" aria-label="Create campaign">
      <div className="space-y-6">
        <nav className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-card/85 p-5 shadow-xl shadow-primary/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between" aria-label="Create campaign navigation">
          <Link to="/campaigns" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <BrandMark subtitle="Create campaign" />
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="rounded-xl bg-background/70">
              <Link to="/campaigns">Back to campaigns</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl bg-background/70">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </nav>

        <ColorfulSectionHeader
          eyebrow="New fundraiser"
          title="Start a campaign draft with a bright, supporter-ready story."
          description="Create the campaign foundation now. You can keep it as a draft, refine every detail, and publish it from the edit screen when it is ready."
          headingLevel={1}
        />

        <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
          <CampaignForm
            mode="create"
            status="draft"
            submitting={submitting}
            apiError={apiError}
            submitLabel="Create draft"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/campaigns')}
          />
        </Card>
      </div>
    </AppShell>
  )
}

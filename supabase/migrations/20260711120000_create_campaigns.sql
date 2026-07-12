-- Module 2: fundraising campaign management schema.
-- Campaigns store fundraiser metadata only. Donation/payment writes are reserved
-- for future modules; amount_raised_cents is present for read-only progress state.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  slug text,
  summary text,
  story text,
  category text,
  location text,
  goal_amount_cents bigint,
  amount_raised_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  cover_image_url text,
  status text NOT NULL DEFAULT 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT campaigns_slug_unique UNIQUE (slug),
  CONSTRAINT campaigns_goal_amount_positive_check CHECK (
    goal_amount_cents IS NULL OR goal_amount_cents > 0
  ),
  CONSTRAINT campaigns_amount_raised_nonnegative_check CHECK (amount_raised_cents >= 0),
  CONSTRAINT campaigns_status_check CHECK (status IN ('draft', 'published', 'archived', 'ended')),
  CONSTRAINT campaigns_currency_format_check CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT campaigns_slug_format_check CHECK (
    slug IS NULL OR slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  CONSTRAINT campaigns_date_range_check CHECK (
    ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at
  ),
  CONSTRAINT campaigns_published_required_fields_check CHECK (
    status NOT IN ('published', 'ended') OR (
      nullif(btrim(title), '') IS NOT NULL
      AND nullif(btrim(story), '') IS NOT NULL
      AND goal_amount_cents IS NOT NULL
      AND goal_amount_cents > 0
      AND currency ~ '^[A-Z]{3}$'
      AND ends_at IS NOT NULL
    )
  ),
  CONSTRAINT campaigns_published_at_lifecycle_check CHECK (
    status NOT IN ('published', 'ended') OR published_at IS NOT NULL
  ),
  CONSTRAINT campaigns_archived_at_lifecycle_check CHECK (
    status <> 'archived' OR archived_at IS NOT NULL
  )
);

-- Keep this migration safe for projects that may have received an earlier draft
-- of the table during iterative builds.
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS starts_at timestamptz;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS ends_at timestamptz;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS campaigns_owner_id_idx ON public.campaigns (owner_id);
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON public.campaigns (status);
CREATE INDEX IF NOT EXISTS campaigns_slug_idx ON public.campaigns (slug);
CREATE INDEX IF NOT EXISTS campaigns_created_at_idx ON public.campaigns (created_at DESC);
CREATE INDEX IF NOT EXISTS campaigns_published_at_idx ON public.campaigns (published_at DESC) WHERE published_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS campaigns_set_updated_at ON public.campaigns;
CREATE TRIGGER campaigns_set_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published campaigns are viewable by anonymous visitors" ON public.campaigns;
CREATE POLICY "Published campaigns are viewable by anonymous visitors"
ON public.campaigns
FOR SELECT
TO anon
USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can view published and own campaigns" ON public.campaigns;
CREATE POLICY "Authenticated users can view published and own campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (status = 'published' OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can insert own campaigns" ON public.campaigns;
CREATE POLICY "Authenticated users can insert own campaigns"
ON public.campaigns
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can update own campaigns" ON public.campaigns;
CREATE POLICY "Authenticated users can update own campaigns"
ON public.campaigns
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can delete own draft campaigns" ON public.campaigns;
CREATE POLICY "Authenticated users can delete own draft campaigns"
ON public.campaigns
FOR DELETE
TO authenticated
USING (owner_id = auth.uid() AND status = 'draft');

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.campaigns TO authenticated;

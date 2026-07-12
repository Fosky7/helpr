import { useMemo, useState, type FormEvent, type HTMLAttributes, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CampaignStatusBadge, { type CampaignStatus } from '@/components/campaigns/CampaignStatusBadge'

export interface CampaignFormValues {
  title: string
  slug: string
  description: string
  story: string
  goal_amount: string
  cover_image_url: string
}

export type CampaignFormErrors = Partial<Record<keyof CampaignFormValues, string>>

interface CampaignFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<CampaignFormValues>
  status?: CampaignStatus | string | null
  submitting?: boolean
  submitLabel?: string
  apiError?: string
  onSubmit: (values: CampaignFormValues) => Promise<void> | void
  onCancel?: () => void
  footerActions?: ReactNode
}

const defaultValues: CampaignFormValues = {
  title: '',
  slug: '',
  description: '',
  story: '',
  goal_amount: '',
  cover_image_url: '',
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function validate(values: CampaignFormValues) {
  const errors: CampaignFormErrors = {}
  const goal = Number(values.goal_amount)

  if (!values.title.trim()) errors.title = 'Campaign title is required.'
  if (!values.slug.trim()) errors.slug = 'Public URL slug is required.'
  if (values.slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug.trim())) {
    errors.slug = 'Use lowercase letters, numbers, and hyphens only.'
  }
  if (!values.description.trim()) errors.description = 'A short description is required.'
  if (!values.story.trim()) errors.story = 'Campaign story is required.'
  if (!values.goal_amount.trim()) errors.goal_amount = 'Fundraising goal is required.'
  if (values.goal_amount.trim() && (!Number.isFinite(goal) || goal <= 0)) {
    errors.goal_amount = 'Goal must be a number greater than 0.'
  }
  if (values.cover_image_url.trim()) {
    try {
      new URL(values.cover_image_url.trim())
    } catch {
      errors.cover_image_url = 'Enter a valid image URL or leave this empty.'
    }
  }

  return errors
}

interface FieldProps {
  id: keyof CampaignFormValues
  label: string
  value: string
  error?: string
  helperText?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
  type?: string
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  onChange: (value: string) => void
  onBlur?: () => void
}

function Field({
  id,
  label,
  value,
  error,
  helperText,
  disabled,
  required,
  placeholder,
  type = 'text',
  inputMode,
  onChange,
  onBlur,
}: FieldProps) {
  const errorId = error ? `${id}-error` : undefined
  const helperId = helperText ? `${id}-helper` : undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-semibold">
        {label}
        {required ? <span className="ml-1 text-primary" aria-hidden="true">*</span> : null}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className={cn(
          'h-11 rounded-xl bg-background/75',
          error ? 'border-destructive focus-visible:ring-destructive/30' : 'border-primary/15 focus-visible:ring-primary/30',
        )}
      />
      {helperText ? <p id={helperId} className="text-xs leading-5 text-muted-foreground">{helperText}</p> : null}
      {error ? <p id={errorId} className="text-xs font-medium leading-5 text-destructive">{error}</p> : null}
    </div>
  )
}

interface TextAreaFieldProps {
  id: keyof CampaignFormValues
  label: string
  value: string
  error?: string
  helperText?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
  rows?: number
  onChange: (value: string) => void
}

function TextAreaField({
  id,
  label,
  value,
  error,
  helperText,
  disabled,
  required,
  placeholder,
  rows = 4,
  onChange,
}: TextAreaFieldProps) {
  const errorId = error ? `${id}-error` : undefined
  const helperId = helperText ? `${id}-helper` : undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-semibold">
        {label}
        {required ? <span className="ml-1 text-primary" aria-hidden="true">*</span> : null}
      </Label>
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'min-h-28 w-full rounded-xl border bg-background/75 px-3.5 py-3 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground/75 focus-visible:ring-4 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:text-muted-foreground',
          error ? 'border-destructive focus-visible:ring-destructive/30' : 'border-primary/15 focus-visible:border-primary focus-visible:ring-primary/30',
        )}
      />
      {helperText ? <p id={helperId} className="text-xs leading-5 text-muted-foreground">{helperText}</p> : null}
      {error ? <p id={errorId} className="text-xs font-medium leading-5 text-destructive">{error}</p> : null}
    </div>
  )
}

export default function CampaignForm({
  mode,
  initialValues,
  status = 'draft',
  submitting = false,
  submitLabel,
  apiError,
  onSubmit,
  onCancel,
  footerActions,
}: CampaignFormProps) {
  const mergedInitialValues = useMemo<CampaignFormValues>(() => ({ ...defaultValues, ...initialValues }), [initialValues])
  const [values, setValues] = useState<CampaignFormValues>(mergedInitialValues)
  const [errors, setErrors] = useState<CampaignFormErrors>({})

  const setValue = (field: keyof CampaignFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    await onSubmit({
      ...values,
      title: values.title.trim(),
      slug: values.slug.trim(),
      description: values.description.trim(),
      story: values.story.trim(),
      goal_amount: values.goal_amount.trim(),
      cover_image_url: values.cover_image_url.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-describedby={apiError ? 'campaign-form-error' : undefined}>
      <div className="space-y-6 p-6 sm:p-8">
        <section className="rounded-3xl border border-primary/20 bg-card/85 p-5 shadow-sm backdrop-blur sm:p-6" aria-labelledby="campaign-basics-title">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Step 1 · Campaign basics
              </div>
              <h2 id="campaign-basics-title" className="mt-3 text-2xl font-bold tracking-tight">
                Name the fundraiser and public page.
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keep the title clear, the slug readable, and the description short enough for cards and previews.
              </p>
            </div>
            <CampaignStatusBadge status={status} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Field
              id="title"
              label="Campaign title"
              value={values.title}
              required
              disabled={submitting}
              error={errors.title}
              placeholder="Community art studio fundraiser"
              onChange={(value) => setValue('title', value)}
              onBlur={() => {
                if (!values.slug.trim() && values.title.trim()) setValue('slug', slugify(values.title))
              }}
            />
            <Field
              id="slug"
              label="Public URL slug"
              value={values.slug}
              required
              disabled={submitting}
              error={errors.slug}
              helperText="Use lowercase letters, numbers, and hyphens."
              placeholder="community-art-studio"
              onChange={(value) => setValue('slug', slugify(value))}
            />
          </div>

          <div className="mt-5">
            <TextAreaField
              id="description"
              label="Short description"
              value={values.description}
              required
              disabled={submitting}
              error={errors.description}
              placeholder="Tell supporters what this campaign funds in one or two sentences."
              rows={3}
              onChange={(value) => setValue('description', value)}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-accent/70 bg-accent/20 p-5 shadow-sm backdrop-blur sm:p-6" aria-labelledby="campaign-story-title">
          <div className="mb-6">
            <div className="inline-flex rounded-full border border-primary/20 bg-background/75 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              Step 2 · Story and goal
            </div>
            <h2 id="campaign-story-title" className="mt-3 text-2xl font-bold tracking-tight">
              Add the colorful story supporters will rally around.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Explain the need, the impact, and the target amount while keeping validation visible and accessible.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-5">
              <Field
                id="goal_amount"
                label="Fundraising goal"
                type="number"
                inputMode="decimal"
                value={values.goal_amount}
                required
                disabled={submitting}
                error={errors.goal_amount}
                placeholder="5000"
                helperText="Enter the goal in USD."
                onChange={(value) => setValue('goal_amount', value)}
              />
              <Field
                id="cover_image_url"
                label="Cover image URL"
                type="url"
                value={values.cover_image_url}
                disabled={submitting}
                error={errors.cover_image_url}
                placeholder="https://example.com/image.jpg"
                helperText="Optional. Use a secure image URL for the campaign hero."
                onChange={(value) => setValue('cover_image_url', value)}
              />
            </div>

            <TextAreaField
              id="story"
              label="Campaign story"
              value={values.story}
              required
              disabled={submitting}
              error={errors.story}
              placeholder="Share the full story, who benefits, and how each contribution helps."
              rows={10}
              onChange={(value) => setValue('story', value)}
            />
          </div>
        </section>

        {apiError ? (
          <div id="campaign-form-error" role="alert" className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {apiError}
          </div>
        ) : null}
      </div>

      <footer className="flex flex-col-reverse gap-3 border-t border-primary/20 bg-muted/20 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          {onCancel ? (
            <Button type="button" variant="outline" className="rounded-xl bg-background/70" disabled={submitting} onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          {footerActions}
        </div>
        <Button type="submit" className="rounded-xl shadow-lg shadow-primary/20" disabled={submitting} aria-busy={submitting}>
          {submitting ? (mode === 'create' ? 'Creating...' : 'Saving...') : submitLabel || (mode === 'create' ? 'Create campaign' : 'Save changes')}
        </Button>
      </footer>
    </form>
  )
}

export { CampaignForm, slugify }

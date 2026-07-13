import * as React from 'react'

type ColorfulSectionHeaderAs = 'header' | 'section' | 'div'
type ColorfulSectionHeaderAlign = 'left' | 'center'
type ColorfulSectionHeaderHeadingLevel = 1 | 2 | 3

interface ColorfulSectionHeaderProps extends React.HTMLAttributes<HTMLElement> {
  as?: ColorfulSectionHeaderAs
  align?: ColorfulSectionHeaderAlign
  eyebrow?: React.ReactNode
  title: React.ReactNode
  titleId?: string
  description?: React.ReactNode
  actions?: React.ReactNode
  icon?: React.ReactNode
  headingLevel?: ColorfulSectionHeaderHeadingLevel
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const headingSizeClasses: Record<ColorfulSectionHeaderHeadingLevel, string> = {
  1: 'text-4xl sm:text-5xl',
  2: 'text-3xl sm:text-4xl',
  3: 'text-2xl sm:text-3xl',
}

const alignClasses: Record<ColorfulSectionHeaderAlign, string> = {
  left: 'items-start text-left',
  center: 'items-center text-center',
}

/**
 * Canonical page header pattern for Renderr.
 *
 * A reusable, design-token‑driven hero/header treatment that provides a
 * colorful background, optional icon, eyebrow badge, title, description,
 * actions and children.  Use this component as the standard page header
 * across the application to maintain visual consistency.
 */
const ColorfulSectionHeader = React.forwardRef<HTMLElement, ColorfulSectionHeaderProps>(
  (
    {
      as = 'header',
      align = 'left',
      eyebrow,
      title,
      titleId,
      description,
      actions,
      icon,
      headingLevel = 2,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const Component = as
    const Heading = `h${headingLevel}` as React.ElementType
    const isCentered = align === 'center'

    return (
      <Component
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-3xl border border-primary/20 bg-card/90 p-6 text-foreground shadow-2xl shadow-primary/10 backdrop-blur sm:p-8',
          className,
        )}
        {...props}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-16 -top-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-accent/50 blur-3xl" />
          <div className="absolute right-8 top-8 hidden h-24 w-24 rounded-full border border-primary/20 sm:block" />
          <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted/30 blur-3xl" />
        </div>

        <div
          className={cn(
            'relative z-10 flex flex-col gap-6',
            alignClasses[align],
            actions && !isCentered && 'lg:flex-row lg:items-end lg:justify-between',
          )}
        >
          <div className={cn('max-w-3xl', isCentered && 'mx-auto')}>
            <div className={cn('mb-5 flex gap-3', isCentered ? 'justify-center' : 'justify-start')}>
              {icon ? (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/20">
                  {icon}
                </div>
              ) : null}

              {eyebrow ? (
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-background/75 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                  {eyebrow}
                </div>
              ) : null}
            </div>

            <Heading
              id={titleId}
              className={cn('text-balance font-bold tracking-tight', headingSizeClasses[headingLevel])}
            >
              {title}
            </Heading>

            {description ? (
              <div className="mt-4 text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                {description}
              </div>
            ) : null}

            {children ? <div className="mt-6">{children}</div> : null}
          </div>

          {actions ? (
            <div className={cn('flex w-full flex-col gap-3 sm:w-auto sm:flex-row', isCentered && 'justify-center')}>
              {actions}
            </div>
          ) : null}
        </div>
      </Component>
    )
  },
)

ColorfulSectionHeader.displayName = 'ColorfulSectionHeader'

export default ColorfulSectionHeader
export { ColorfulSectionHeader }
export type { ColorfulSectionHeaderProps }

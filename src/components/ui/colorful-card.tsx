import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ColorfulCardVariant = 'default' | 'feature' | 'accent' | 'muted'

interface ColorfulCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  variant?: ColorfulCardVariant
  decorative?: boolean
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const variantClasses: Record<ColorfulCardVariant, string> = {
  default: 'border-border bg-card/85 shadow-sm',
  feature: 'border-primary/20 bg-card/90 shadow-xl shadow-primary/10',
  accent: 'border-accent/60 bg-accent/20 shadow-sm shadow-accent/20',
  muted: 'border-border bg-muted/30 shadow-sm',
}

/**
 * ColorfulCard composes the existing shadcn Card primitive and centralizes Renderr's
 * colorful token-based card styling. Use it where pages need the new visual system
 * without changing the underlying Card/Header/Content/Footer APIs.
 */
const ColorfulCard = React.forwardRef<React.ElementRef<typeof Card>, ColorfulCardProps>(
  ({ className, variant = 'default', decorative = true, children, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-3xl text-foreground backdrop-blur transition-colors hover:border-primary/30',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {decorative ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-16 left-6 h-36 w-36 rounded-full bg-accent/35 blur-3xl" />
          <div className="absolute right-6 top-6 h-16 w-16 rounded-full border border-primary/15" />
        </div>
      ) : null}
      <div className="relative z-10">{children}</div>
    </Card>
  ),
)

ColorfulCard.displayName = 'ColorfulCard'

const ColorfulCardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardHeader>
>(({ className, ...props }, ref) => (
  <CardHeader ref={ref} className={cn('border-b border-border/80 bg-muted/20', className)} {...props} />
))
ColorfulCardHeader.displayName = 'ColorfulCardHeader'

const ColorfulCardTitle = React.forwardRef<
  React.ElementRef<typeof CardTitle>,
  React.ComponentPropsWithoutRef<typeof CardTitle>
>(({ className, ...props }, ref) => (
  <CardTitle ref={ref} className={cn('tracking-tight', className)} {...props} />
))
ColorfulCardTitle.displayName = 'ColorfulCardTitle'

const ColorfulCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof CardDescription>
>(({ className, ...props }, ref) => (
  <CardDescription ref={ref} className={cn('leading-6', className)} {...props} />
))
ColorfulCardDescription.displayName = 'ColorfulCardDescription'

const ColorfulCardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardContent>
>(({ className, ...props }, ref) => (
  <CardContent ref={ref} className={cn('p-6', className)} {...props} />
))
ColorfulCardContent.displayName = 'ColorfulCardContent'

const ColorfulCardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardFooter>
>(({ className, ...props }, ref) => (
  <CardFooter ref={ref} className={cn('border-t border-border/80 bg-muted/20 p-6', className)} {...props} />
))
ColorfulCardFooter.displayName = 'ColorfulCardFooter'

export {
  ColorfulCard,
  ColorfulCardHeader,
  ColorfulCardTitle,
  ColorfulCardDescription,
  ColorfulCardContent,
  ColorfulCardFooter,
}
export type { ColorfulCardProps, ColorfulCardVariant }

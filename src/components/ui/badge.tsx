import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground shadow-sm shadow-secondary/15 hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow-sm shadow-destructive/15 hover:bg-destructive/90',
        outline:
          'border-primary/20 bg-background/70 text-foreground shadow-sm backdrop-blur hover:border-primary/35 hover:bg-primary/10 hover:text-primary',
        accent:
          'border-accent/70 bg-accent/35 text-accent-foreground shadow-sm shadow-accent/15 hover:bg-accent/45',
        muted:
          'border-border bg-muted/60 text-muted-foreground shadow-sm hover:bg-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

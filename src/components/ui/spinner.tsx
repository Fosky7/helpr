import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SpinnerProps {
  className?: string
  /** Icon size in pixels. Defaults to 16. */
  size?: number
  /**
   * When provided, the spinner is announced to assistive technology as a
   * live status region with this label. When omitted, the spinner is
   * treated as decorative (aria-hidden).
   */
  label?: string
}

/**
 * Spinner renders an animated Loader2 icon for use inside buttons and other
 * inline loading states. Pair with `aria-busy` on the parent container for
 * full accessibility, or provide a `label` when the spinner is standalone.
 */
function Spinner({ className, size = 16, label }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin', className)}
      size={size}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}

export { Spinner }

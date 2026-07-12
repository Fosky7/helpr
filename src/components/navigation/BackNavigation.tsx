import { useCallback, type ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import useBackNavigation from '@/hooks/useBackNavigation'
import type { To } from 'react-router-dom'

type ButtonProps = ComponentProps<typeof Button>

type BeforeNavigateResult = boolean | void | Promise<boolean | void>

export interface BackNavigationProps {
  /** Safe destination used when browser history is not reliable. */
  fallbackTo: To
  /** Visible button label. */
  label?: string
  /** Accessible label. Defaults to the visible label. */
  ariaLabel?: string
  /** Button visual variant. Defaults to outline. */
  variant?: ButtonProps['variant']
  /** Additional classes appended after the default navigation styling. */
  className?: string
  /** Button size, matching the underlying Button component. */
  size?: ButtonProps['size']
  /** Whether fallback navigation should replace the current history entry. */
  replaceFallback?: boolean
  /** Optional guard hook for future dirty-form confirmations. Return false to cancel navigation. */
  beforeNavigate?: () => BeforeNavigateResult
}

export default function BackNavigation({
  fallbackTo,
  label = 'Back',
  ariaLabel,
  variant = 'outline',
  className,
  size,
  replaceFallback = false,
  beforeNavigate,
}: BackNavigationProps) {
  const { goBack } = useBackNavigation({ fallbackTo, replaceFallback })
  const resolvedAriaLabel = ariaLabel ?? label

  const handleClick = useCallback(async () => {
    const shouldContinue = await beforeNavigate?.()

    if (shouldContinue === false) return

    goBack()
  }, [beforeNavigate, goBack])

  const classes = ['rounded-xl bg-background/70', className].filter(Boolean).join(' ')

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={resolvedAriaLabel}
      className={classes}
      onClick={handleClick}
    >
      <span aria-hidden="true" className="mr-2 inline-block">
        ←
      </span>
      <span>{label}</span>
    </Button>
  )
}

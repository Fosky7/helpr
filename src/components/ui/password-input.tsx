import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Override the accessible label for the show/hide toggle button.
   * Defaults to "Show password" when hidden and "Hide password" when visible.
   */
  toggleAriaLabel?: string
}

/**
 * PasswordInput wraps the existing shadcn/ui Input with a show/hide toggle.
 *
 * The toggle button is keyboard accessible, exposes `aria-pressed` to indicate
 * the current visibility state, and is labelled for screen readers. Focus
 * management is preserved — toggling visibility does not move focus away from
 * the control, so users can verify what they typed without losing their place.
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ toggleAriaLabel, className, disabled, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          disabled={disabled}
          className={cn('pr-11', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={toggleAriaLabel ?? (visible ? 'Hide password' : 'Show password')}
          aria-pressed={visible}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }

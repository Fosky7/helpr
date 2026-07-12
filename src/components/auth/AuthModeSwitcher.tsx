import { Button } from '@/components/ui/button'

export type AuthMode = 'login' | 'signup'

export interface AuthModeSwitcherProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  className?: string
}

const modeOptions: Array<{ mode: AuthMode; label: string }> = [
  { mode: 'login', label: 'Log in' },
  { mode: 'signup', label: 'Sign up' },
]

export function AuthModeSwitcher({ mode, onModeChange, className = '' }: AuthModeSwitcherProps) {
  return (
    <div
      className={`grid grid-cols-2 gap-2 rounded-2xl border border-primary/20 bg-muted/30 p-1.5 ${className}`}
      role="tablist"
      aria-label="Choose authentication mode"
    >
      {modeOptions.map((option) => {
        const isActive = option.mode === mode

        return (
          <Button
            key={option.mode}
            type="button"
            variant={isActive ? 'default' : 'ghost'}
            className={`h-10 rounded-xl ${isActive ? 'shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => onModeChange(option.mode)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${option.mode}-auth-panel`}
          >
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}

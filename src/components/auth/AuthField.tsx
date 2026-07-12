import { useId, type InputHTMLAttributes } from 'react'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type AuthFieldStatus = 'default' | 'error' | 'success'

export interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label: string
  error?: string
  success?: string
  helperText?: string
  containerClassName?: string
}

export function AuthField({
  id,
  label,
  error,
  success,
  helperText,
  className,
  containerClassName,
  required,
  disabled,
  ...inputProps
}: AuthFieldProps) {
  const generatedId = useId()
  const helperId = helperText ? `${id}-${generatedId}-helper` : undefined
  const errorId = error ? `${id}-${generatedId}-error` : undefined
  const successId = success ? `${id}-${generatedId}-success` : undefined
  const describedBy = [helperId, errorId, successId].filter(Boolean).join(' ') || undefined
  const status: AuthFieldStatus = error ? 'error' : success ? 'success' : 'default'

  return (
    <div className={cx('space-y-2', containerClassName)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold leading-none text-foreground">
          {label}
          {required ? <span className="ml-1 text-primary" aria-hidden="true">*</span> : null}
        </label>
        {disabled ? (
          <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
            Disabled
          </span>
        ) : null}
      </div>

      <div className="relative">
        <input
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(
            'peer h-11 w-full rounded-xl border bg-background/75 px-3.5 py-2 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground/75',
            'focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20',
            'disabled:cursor-not-allowed disabled:border-border disabled:bg-muted/60 disabled:text-muted-foreground disabled:opacity-100',
            status === 'default' && 'border-border hover:border-primary/30',
            status === 'error' && 'border-destructive bg-destructive/5 pr-10 text-foreground focus-visible:border-destructive focus-visible:ring-destructive/20',
            status === 'success' && 'border-primary/40 bg-primary/5 pr-10 focus-visible:border-primary focus-visible:ring-primary/20',
            className,
          )}
          {...inputProps}
        />

        {status !== 'default' ? (
          <span
            className={cx(
              'pointer-events-none absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-xs font-black',
              status === 'error' && 'bg-destructive text-destructive-foreground',
              status === 'success' && 'bg-primary text-primary-foreground',
            )}
            aria-hidden="true"
          >
            {status === 'error' ? '!' : '✓'}
          </span>
        ) : null}
      </div>

      {helperText ? (
        <p id={helperId} className="text-xs leading-5 text-muted-foreground">
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="flex gap-2 text-xs font-medium leading-5 text-destructive">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}

      {success ? (
        <p id={successId} className="flex gap-2 text-xs font-medium leading-5 text-primary">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span>{success}</span>
        </p>
      ) : null}
    </div>
  )
}

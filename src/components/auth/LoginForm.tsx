import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { AuthAlert } from '@/components/auth/AuthAlert'
import { AuthField } from '@/components/auth/AuthField'

type LoginFieldErrors = Partial<Record<'email' | 'password', string>>

export interface LoginFormProps {
  onSignupClick?: () => void
  successRedirectTo?: string
}

export function LoginForm({ onSignupClick, successRedirectTo = '/dashboard' }: LoginFormProps) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
  const [loading, setLoading] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const clearError = () => {
    setError('')
    setFieldErrors({})
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const nextFieldErrors: LoginFieldErrors = {}
    if (!email.trim()) nextFieldErrors.email = 'Email is required.'
    if (!password) nextFieldErrors.password = 'Password is required.'

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    const { error: signInError } = await signIn(email.trim(), password)
    if (!mountedRef.current) return

    if (signInError) {
      setError(signInError)
      setLoading(false)
      return
    }

    navigate(successRedirectTo, { replace: true })
    setLoading(false)
  }

  return (
    <form
      id="login-auth-panel"
      noValidate
      onSubmit={handleSubmit}
      aria-describedby={error ? 'login-form-error' : undefined}
      className="space-y-6"
      role="tabpanel"
      aria-label="Log in to Renderr"
    >
      <div className="space-y-5">
        <AuthField
          id="login-email"
          name="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearError()
          }}
          autoComplete="email"
          inputMode="email"
          required
          disabled={loading}
          error={fieldErrors.email}
        />

        <AuthField
          id="login-password"
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            clearError()
          }}
          autoComplete="current-password"
          required
          disabled={loading}
          error={fieldErrors.password}
        />

        {error ? (
          <AuthAlert id="login-form-error" variant="error">
            {error}
          </AuthAlert>
        ) : null}
      </div>

      <div className="space-y-4">
        <Button type="submit" className="h-11 w-full rounded-xl shadow-lg shadow-primary/20" disabled={loading} aria-busy={loading}>
          {loading ? 'Signing in...' : 'Sign in to Renderr'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          {onSignupClick ? (
            <button
              type="button"
              onClick={onSignupClick}
              className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Sign up
            </button>
          ) : (
            <Link
              to="/auth?mode=signup"
              className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Sign up
            </Link>
          )}
        </p>

        <p className="text-center text-sm text-muted-foreground">
          Wondering if Renderr is done yet?{' '}
          <Link
            to="/status"
            className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View status.
          </Link>
        </p>
      </div>
    </form>
  )
}

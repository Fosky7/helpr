import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { AuthAlert } from '@/components/auth/AuthAlert'
import { AuthField } from '@/components/auth/AuthField'

type SignupFieldErrors = Partial<Record<'email' | 'password' | 'confirmPassword', string>>

export interface SignupFormProps {
  onLoginClick?: () => void
}

export function SignupForm({ onLoginClick }: SignupFormProps) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const clearMessages = () => {
    setError('')
    setMessage('')
    setFieldErrors({})
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setFieldErrors({})

    const nextFieldErrors: SignupFieldErrors = {}
    if (!email.trim()) nextFieldErrors.email = 'Email is required.'
    if (!password) nextFieldErrors.password = 'Password is required.'
    if (!confirmPassword) nextFieldErrors.confirmPassword = 'Please confirm your password.'

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setError('All fields are required.')
      return
    }

    if (password !== confirmPassword) {
      setFieldErrors({
        password: 'Passwords must match.',
        confirmPassword: 'Passwords must match.',
      })
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setFieldErrors({ password: 'Use at least 6 characters.' })
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const { error: signUpError } = await signUp(email.trim(), password)
    if (!mountedRef.current) return

    if (signUpError) {
      setError(signUpError)
      setLoading(false)
      return
    }

    setMessage('Check your email for a confirmation link to Renderr.')
    setLoading(false)
  }

  return (
    <form
      id="signup-auth-panel"
      noValidate
      onSubmit={handleSubmit}
      aria-describedby={error ? 'signup-form-error' : message ? 'signup-form-success' : undefined}
      className="space-y-6"
      role="tabpanel"
      aria-label="Create a Renderr account"
    >
      <div className="space-y-5">
        <AuthField
          id="signup-email"
          name="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearMessages()
          }}
          autoComplete="email"
          inputMode="email"
          required
          disabled={loading}
          error={fieldErrors.email}
        />

        <AuthField
          id="signup-password"
          name="password"
          label="Password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            clearMessages()
          }}
          autoComplete="new-password"
          required
          disabled={loading}
          helperText="Use at least 6 characters."
          error={fieldErrors.password}
        />

        <AuthField
          id="signup-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            clearMessages()
          }}
          autoComplete="new-password"
          required
          disabled={loading}
          error={fieldErrors.confirmPassword}
        />

        {error ? (
          <AuthAlert id="signup-form-error" variant="error">
            {error}
          </AuthAlert>
        ) : null}

        {message ? (
          <AuthAlert id="signup-form-success" variant="success" title="Almost there">
            {message}
          </AuthAlert>
        ) : null}
      </div>

      <div className="space-y-4">
        <Button type="submit" className="h-11 w-full rounded-xl shadow-lg shadow-primary/20" disabled={loading} aria-busy={loading}>
          {loading ? 'Creating account...' : 'Join Renderr'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          {onLoginClick ? (
            <button
              type="button"
              onClick={onLoginClick}
              className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Sign in
            </button>
          ) : (
            <Link
              to="/auth?mode=login"
              className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Sign in
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

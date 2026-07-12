import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import { PasswordInput } from '@/components/ui/password-input'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useFormValidation } from '@/lib/authValidation'

/**
 * Translate a Supabase auth error into a friendly, actionable user message.
 * Special-cases rate limiting (429) so users get guidance instead of a raw SDK string.
 */
function parseAuthError(error: any): string {
  const rawMessage = error?.message || ''
  const message = rawMessage.toLowerCase()
  const status = error?.status

  // Rate limiting — Supabase returns HTTP 429 for auth rate limits.
  if (
    status === 429 ||
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('too many attempts')
  ) {
    return 'Too many login attempts. Please wait a minute and try again.'
  }

  // Invalid credentials — Supabase returns this for wrong password / unknown email.
  if (message.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.'
  }

  // Network / connectivity issues.
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Unable to connect. Please check your internet connection and try again.'
  }

  return rawMessage || 'An unexpected error occurred.'
}

const AuthPage = () => {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  const navigate = useNavigate()
  const { user } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    showEmailError,
    showPasswordError,
    markEmailTouched,
    markPasswordTouched,
    validateAll,
  } = useFormValidation(email, password)

  // Redirect if already logged in — use declarative <Navigate> instead of
  // calling navigate() during render, which crashes the React tree and
  // produces a blank white page when a session persists.
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Run validation and surface all errors before hitting the network.
    if (!validateAll()) {
      return
    }

    setLoading(true)

    try {
      // Normalize email to lowercase to avoid duplicate-account confusion.
      const normalizedEmail = email.trim().toLowerCase()

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        })
        if (error) throw error
        toast.success('Account created! Welcome to Renderr.')
        navigate('/dashboard', { replace: true })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })
        if (error) throw error
        toast.success('Welcome back!')
        navigate('/dashboard', { replace: true })
      }
    } catch (error: any) {
      toast.error(parseAuthError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell centered maxWidthClassName="max-w-md" aria-label="Authentication">
      <div className="mb-4 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>

      <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="relative border-b border-primary/20 bg-gradient-to-br from-primary/15 via-accent/30 to-card p-6">
          <BrandMark subtitle={mode === 'signup' ? 'Create account' : 'Log in'} className="mb-4" />
          <CardTitle className="text-2xl tracking-tight">
            {mode === 'signup' ? 'Start your Renderr journey' : 'Welcome back'}
          </CardTitle>
          <CardDescription>
            {mode === 'signup'
              ? 'Create an account to launch and manage fundraisers.'
              : 'Log in to manage your campaigns and profile.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4 p-6">
            <SocialAuthButtons />

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={markEmailTouched}
                required
                disabled={loading}
                autoComplete="email"
                aria-invalid={showEmailError ? true : undefined}
                aria-describedby={showEmailError ? 'email-error' : undefined}
                className="h-11 rounded-xl border-primary/20 bg-card/80"
              />
              {showEmailError ? (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {showEmailError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={markPasswordTouched}
                required
                minLength={6}
                disabled={loading}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                aria-invalid={showPasswordError ? true : undefined}
                aria-describedby={showPasswordError ? 'password-error' : undefined}
                className="h-11 rounded-xl border-primary/20 bg-card/80"
              />
              {showPasswordError ? (
                <p id="password-error" className="text-sm text-destructive" role="alert">
                  {showPasswordError}
                </p>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-primary/20 bg-muted/20 p-6">
            <Button
              type="submit"
              className="w-full rounded-xl shadow-lg shadow-primary/20"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  {mode === 'signup' ? 'Creating account…' : 'Logging in…'}
                </>
              ) : mode === 'signup' ? (
                'Create Account'
              ) : (
                'Log In'
              )}
            </Button>

            <div className="text-sm text-muted-foreground text-center">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <Link to="/auth?mode=login" className="font-semibold text-primary hover:underline">
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
                    Forgot password?
                  </Link>
                  <br />
                  Don't have an account?{' '}
                  <Link to="/auth?mode=signup" className="font-semibold text-primary hover:underline">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </AppShell>
  )
}

export default AuthPage

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import { PasswordInput } from '@/components/ui/password-input'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const UpdatePasswordPage = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setHasSession(true)
      }
      setSessionChecked(true)
    })
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated successfully! You can now log in with your new password.')
      navigate('/auth?mode=login', { replace: true })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  if (!sessionChecked) {
    return (
      <AppShell centered maxWidthClassName="max-w-md" aria-label="Loading recovery session">
        <Card className="border-primary/20 bg-card/90 text-center shadow-xl shadow-primary/10 backdrop-blur">
          <CardContent className="p-8">
            <BrandMark compact size="lg" className="mb-5" />
            <p className="text-sm text-muted-foreground">Verifying your recovery session...</p>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  if (!hasSession) {
    return (
      <AppShell centered maxWidthClassName="max-w-md" aria-label="No recovery session">
        <Card className="border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
          <CardContent className="p-8 text-center space-y-4">
            <BrandMark compact size="lg" />
            <p className="text-sm text-muted-foreground">
              Invalid or expired recovery link. Please request a new password reset.
            </p>
            <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
              <Link to="/forgot-password">Request reset again</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell centered maxWidthClassName="max-w-md" aria-label="Set new password">
      <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="relative border-b border-primary/20 bg-gradient-to-br from-primary/15 via-accent/30 to-card p-6">
          <BrandMark subtitle="New password" className="mb-4" />
          <CardTitle className="text-2xl tracking-tight">Set a new password</CardTitle>
          <CardDescription>
            Choose a strong password for your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <PasswordInput
                id="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                autoComplete="new-password"
                className="h-11 rounded-xl border-primary/20 bg-card/80"
              />
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
                  Updating…
                </>
              ) : (
                'Update password'
              )}
            </Button>
            <Link
              to="/auth?mode=login"
              className="text-sm font-semibold text-primary hover:underline text-center"
            >
              Back to log in
            </Link>
          </CardFooter>
        </form>
      </Card>
    </AppShell>
  )
}

export default UpdatePasswordPage

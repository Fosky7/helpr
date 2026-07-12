import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) throw error
      setSent(true)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell centered maxWidthClassName="max-w-md" aria-label="Forgot password">
      <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="relative border-b border-primary/20 bg-gradient-to-br from-primary/15 via-accent/30 to-card p-6">
          <BrandMark subtitle="Reset password" className="mb-4" />
          <CardTitle className="text-2xl tracking-tight">Trouble logging in?</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || sent}
                className="h-11 rounded-xl border-primary/20 bg-card/80"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-primary/20 bg-muted/20 p-6">
            {sent ? (
              <p className="text-sm text-muted-foreground text-center">
                Check your email for the reset link. Didn't receive it? Check spam or try again.
              </p>
            ) : (
              <Button
                type="submit"
                className="w-full rounded-xl shadow-lg shadow-primary/20"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            )}
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

export default ForgotPasswordPage
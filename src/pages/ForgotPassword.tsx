import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import AppShell from '@/components/layout/AppShell';
import BrandMark from '@/components/brand/BrandMark';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cardPrimary } from '@/lib/styles';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);

    if (error) {
      toast.error(error.message || 'An unexpected error occurred.');
    } else {
      setSuccess(true);
      toast.success('Check your email for the password reset link.');
    }
  };

  return (
    <AppShell centered maxWidthClassName="max-w-md" aria-label="Forgot password page">
      <Card className={`${cardPrimary} overflow-hidden`}>
        <CardHeader className="relative border-b border-primary/20 bg-gradient-to-br from-primary/15 via-accent/30 to-card p-6">
          <BrandMark subtitle="Reset your password" className="mb-4" />
          <CardTitle className="text-2xl tracking-tight">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        {success ? (
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              If an account with that email exists, we've sent a password reset link. Please check your inbox
              and follow the instructions.
            </p>
            <Button asChild className="w-full rounded-xl shadow-lg shadow-primary/20">
              <Link to="/login">Back to login</Link>
            </Button>
          </CardContent>
        ) : (
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
                  disabled={loading}
                  className="h-11 rounded-xl border-primary/20 bg-card/80"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t border-primary/20 bg-muted/20 p-6">
              <Button
                type="submit"
                className="w-full rounded-xl shadow-lg shadow-primary/20"
                disabled={loading}
              >
                {loading ? 'Sending reset link...' : 'Send reset link'}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Remember your password?{' '}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </AppShell>
  );
}
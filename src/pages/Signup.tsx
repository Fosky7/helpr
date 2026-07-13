import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AppShell from '@/components/layout/AppShell';
import BrandMark from '@/components/brand/BrandMark';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cardPrimary } from '@/lib/styles';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success('Check your email for the confirmation link.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell centered maxWidthClassName="max-w-md" aria-label="Signup page">
      <Card className={`${cardPrimary} overflow-hidden`}>
        <CardHeader className="relative border-b border-primary/20 bg-gradient-to-br from-primary/15 via-accent/30 to-card p-6">
          <BrandMark subtitle="Join Renderr" className="mb-4" />
          <CardTitle className="text-2xl tracking-tight">Create your account</CardTitle>
          <CardDescription>
            Start your fundraising journey today.
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
                disabled={loading}
                className="h-11 rounded-xl border-primary/20 bg-card/80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-xl border-primary/20 bg-card/80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AppShell>
  );
}

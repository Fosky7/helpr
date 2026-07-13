import { useNavigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import BrandMark from '@/components/brand/BrandMark';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignupForm } from '@/components/auth/SignupForm';
import { cardPrimary } from '@/lib/styles';

export default function Signup() {
  const navigate = useNavigate();

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
        <CardContent className="p-6">
          <SignupForm onLoginClick={() => navigate('/auth?mode=login')} />
        </CardContent>
      </Card>
    </AppShell>
  );
}

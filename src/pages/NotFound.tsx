import { Link } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cardPrimary } from '@/lib/styles';

export default function NotFound() {
  return (
    <AppShell centered maxWidthClassName="max-w-md" aria-label="Page not found">
      <Card className={`${cardPrimary} text-center`}>
        <CardHeader>
          <CardTitle className="text-4xl font-bold tracking-tight text-primary">404</CardTitle>
          <CardDescription className="mt-4 text-base text-muted-foreground">
            The page you were looking for does not exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
            <Link to="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}

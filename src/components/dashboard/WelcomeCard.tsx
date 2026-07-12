import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface WelcomeCardProps {
  name: string
}

export default function WelcomeCard({ name }: WelcomeCardProps) {
  return (
    <Card className="border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
      <CardHeader className="p-6 sm:p-8">
        <CardTitle className="text-3xl font-bold tracking-tight">
          Welcome back, {name}!
        </CardTitle>
        <CardDescription className="mt-2 text-sm leading-6 text-muted-foreground">
          Manage your campaigns and track your fundraising progress.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
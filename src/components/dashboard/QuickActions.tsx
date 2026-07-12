import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function QuickActions() {
  return (
    <Card className="border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold tracking-tight mb-4">Quick Actions</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Jump into your most common tasks right from your dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="rounded-xl shadow-lg shadow-primary/20 flex-1">
            <Link to="/campaigns/new">Create Campaign</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl bg-background/70 flex-1">
            <Link to="/fundraisers">Browse Fundraisers</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl bg-background/70 flex-1">
            <Link to="/account">Edit Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

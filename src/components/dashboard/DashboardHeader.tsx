import { Link } from 'react-router-dom'
import BrandMark from '@/components/brand/BrandMark'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  onSignOut: () => void
  signingOut: boolean
}

export default function DashboardHeader({ onSignOut, signingOut }: DashboardHeaderProps) {
  return (
    <header className="flex min-w-0 flex-col gap-4 rounded-3xl border border-primary/20 bg-card/85 p-5 shadow-xl shadow-primary/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <Link to="/dashboard" className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <BrandMark subtitle="Dashboard" size="md" />
      </Link>

      <nav className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end" aria-label="Dashboard navigation">
        <Button asChild variant="outline" className="rounded-xl bg-background/70">
          <Link to="/account">Edit Profile</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl bg-background/70">
          <Link to="/fundraisers">Browse Fundraisers</Link>
        </Button>
        <Button variant="outline" onClick={onSignOut} disabled={signingOut} className="rounded-xl bg-background/70">
          {signingOut ? 'Signing out...' : 'Sign out'}
        </Button>
      </nav>
    </header>
  )
}

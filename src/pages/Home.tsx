import { Link } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  return (
    <AppShell centered maxWidthClassName="max-w-6xl" background="celebration" contentClassName="gap-10">
      <section aria-labelledby="hero-title" className="relative flex flex-col items-center text-center">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute right-0 top-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            Colorful creative fundraising
          </div>

          <h1 id="hero-title" className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
            Bring your campaign to life with <span className="text-primary">Renderr</span>
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            From drafting your first campaign to celebrating every milestone, Renderr gives you a bright, modern workspace to build, share, and manage fundraisers.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20 px-8">
              <Link to="/auth?mode=signup">Start a fundraiser</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl bg-background/70 px-8">
              <Link to="/auth?mode=login">Log in</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl bg-background/70 px-8">
              <Link to="/fundraisers">Browse fundraisers</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3" aria-labelledby="features-title">
        <h2 id="features-title" className="sr-only">Key features</h2>
        <Card className="relative overflow-hidden border-primary/20 bg-card/90 p-6 shadow-xl shadow-primary/10 backdrop-blur">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/15 blur-2xl" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">01</div>
            <h3 className="text-xl font-semibold">Create with clarity</h3>
            <p className="text-sm leading-6 text-muted-foreground">Build campaign drafts with easy-to-use forms that keep your story front and center.</p>
          </div>
        </Card>
        <Card className="relative overflow-hidden border-primary/20 bg-card/90 p-6 shadow-xl shadow-primary/10 backdrop-blur">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/20 blur-2xl" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">02</div>
            <h3 className="text-xl font-semibold">Share with confidence</h3>
            <p className="text-sm leading-6 text-muted-foreground">Publish campaign pages that supporters can discover and share with a public link.</p>
          </div>
        </Card>
        <Card className="relative overflow-hidden border-primary/20 bg-card/90 p-6 shadow-xl shadow-primary/10 backdrop-blur">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/15 blur-2xl" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">03</div>
            <h3 className="text-xl font-semibold">Track your impact</h3>
            <p className="text-sm leading-6 text-muted-foreground">Monitor fundraising progress and manage updates from a colorful dashboard.</p>
          </div>
        </Card>
      </section>

      <Footer />
    </AppShell>
  )
}

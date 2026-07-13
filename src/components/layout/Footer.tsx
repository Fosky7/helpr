import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-card/90 py-8 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <Link to="/" className="inline-flex min-h-10 items-center text-sm font-semibold text-primary hover:underline">Home</Link>
          <Link to="/fundraisers" className="inline-flex min-h-10 items-center text-sm font-semibold text-primary hover:underline">Fundraisers</Link>
          <Link to="/status" className="inline-flex min-h-10 items-center text-sm font-semibold text-primary hover:underline">Status</Link>
          <Link to="/privacy" className="inline-flex min-h-10 items-center text-sm font-semibold text-primary hover:underline">Privacy</Link>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Renderr. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

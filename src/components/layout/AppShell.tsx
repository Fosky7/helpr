import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AppShellProps = {
  children: ReactNode
  centered?: boolean
  maxWidthClassName?: string
  contentClassName?: string
  background?: 'default' | 'celebration'
  'aria-label'?: string
}

export default function AppShell({
  children,
  centered = false,
  maxWidthClassName = 'max-w-7xl',
  contentClassName = '',
  background = 'default',
  'aria-label': ariaLabel,
}: AppShellProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth?mode=login', { replace: true })
  }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/campaigns', label: 'Campaigns' },
    { to: '/fundraisers', label: 'Discover' },
  ]

  return (
    <div className={cn('relative flex min-h-screen flex-col', background === 'celebration' && 'bg-gradient-to-br from-primary/5 via-background to-accent/10')}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/80 backdrop-blur">
        <div className={`mx-auto flex items-center justify-between px-4 py-3 sm:px-6 ${maxWidthClassName}`}>
          <Link to="/" className="text-xl font-bold tracking-tighter text-primary">
            Renderr
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Button
                key={link.to}
                asChild
                variant="ghost"
                className={cn(
                  'rounded-xl text-sm font-medium transition-colors',
                  isActive(link.to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                )}
              >
                <Link to={link.to}>{link.label}</Link>
              </Button>
            ))}
          </nav>

          {/* User menu + mobile toggle */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="hidden rounded-xl bg-background/70 sm:inline-flex"
                >
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="hidden rounded-xl px-3 text-muted-foreground hover:text-destructive sm:inline-flex"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" className="rounded-xl bg-background/70">
                <Link to="/auth?mode=login">Sign in</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="border-t border-primary/10 bg-background/95 backdrop-blur md:hidden">
            <div className="flex flex-col gap-2 px-4 py-4">
              {navLinks.map((link) => (
                <Button
                  key={link.to}
                  asChild
                  variant="ghost"
                  className={cn(
                    'justify-start rounded-xl text-sm font-medium',
                    isActive(link.to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to={link.to}>{link.label}</Link>
                </Button>
              ))}
              {user && (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    className="justify-start rounded-xl text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleSignOut()
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Main content */}
      <main
        aria-label={ariaLabel}
        className={cn(
          'flex-1 px-4 py-8 sm:px-6 lg:py-10',
          centered && 'flex flex-col items-center justify-start pt-12'
        )}
      >
        <div className={cn('mx-auto w-full', maxWidthClassName, contentClassName)}>
          {children}
        </div>
      </main>
    </div>
  )
}
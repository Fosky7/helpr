import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandMark from '@/components/brand/BrandMark'
import { Button } from '@/components/ui/button'

type HomeNavItem = {
  to: string
  label: string
  description: string
  emphasis?: 'primary'
}

const navigationItems: HomeNavItem[] = [
  {
    to: '/',
    label: 'Home',
    description: 'Return to the Renderr landing page.',
  },
  {
    to: '/#features',
    label: 'How it works',
    description: 'See how Renderr helps you create, share, and track campaigns.',
  },
  {
    to: '/fundraisers',
    label: 'Browse fundraisers',
    description: 'Discover active campaigns from the Renderr community.',
  },
  {
    to: '/auth?mode=login',
    label: 'Log in',
    description: 'Access your dashboard and manage your fundraisers.',
  },
  {
    to: '/auth?mode=signup',
    label: 'Start a fundraiser',
    description: 'Create your first campaign in a bright, guided workspace.',
    emphasis: 'primary',
  },
]

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target
      if (target instanceof Node && headerRef.current && !headerRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <header ref={headerRef} className="relative z-30 w-full" aria-label="Renderr home header">
      <div className="relative overflow-visible rounded-3xl border border-primary/20 bg-card/85 px-4 py-3 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:px-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
          <div className="absolute -left-10 -top-14 h-28 w-28 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-10 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-accent/30 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="min-w-0 rounded-2xl transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Renderr home"
            onClick={() => setMenuOpen(false)}
          >
            <BrandMark subtitle="Creative fundraising" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="hidden items-center gap-2 lg:flex" aria-label="Home quick navigation">
              <Link
                to="/fundraisers"
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Browse
              </Link>
              <Link
                to="/auth?mode=login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Log in
              </Link>
              <Button asChild size="sm" className="rounded-full px-5 shadow-lg shadow-primary/20">
                <Link to="/auth?mode=signup">Start fundraising</Link>
              </Button>
            </nav>

            <button
              type="button"
              className="group inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-background/75 text-foreground shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-controls={menuId}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
              <span className="relative h-5 w-5" aria-hidden="true">
                <span
                  className={cx(
                    'absolute left-0 top-1 block h-0.5 w-5 rounded-full bg-current transition-transform duration-200',
                    menuOpen && 'translate-y-2 rotate-45',
                  )}
                />
                <span
                  className={cx(
                    'absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-opacity duration-200',
                    menuOpen && 'opacity-0',
                  )}
                />
                <span
                  className={cx(
                    'absolute bottom-1 left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-200',
                    menuOpen && '-translate-y-2 -rotate-45',
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        <div
          id={menuId}
          className={cx(
            'absolute right-0 top-full mt-3 w-full origin-top-right rounded-3xl border border-primary/20 bg-card/95 p-3 shadow-2xl shadow-primary/15 backdrop-blur-xl transition-all duration-200 sm:w-[24rem]',
            menuOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
          )}
        >
          <nav aria-label="Home menu">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={cx(
                    'group block rounded-2xl border p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    item.emphasis === 'primary'
                      ? 'border-primary/25 bg-primary/10 hover:border-primary/40 hover:bg-primary/15'
                      : 'border-transparent hover:border-primary/20 hover:bg-primary/5',
                  )}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className={cx('text-sm font-bold', item.emphasis === 'primary' ? 'text-primary' : 'text-foreground')}>
                      {item.label}
                    </span>
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background/80 text-sm font-black text-primary ring-1 ring-primary/15 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.description}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

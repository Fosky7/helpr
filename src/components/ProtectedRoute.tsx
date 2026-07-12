import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

type AuthWithOptionalLoading = ReturnType<typeof useAuth> & {
  loading?: boolean
  isLoading?: boolean
}

function ProtectedRouteLoadingState() {
  return (
    <AppShell centered maxWidthClassName="max-w-sm" background="subtle" aria-label="Checking Renderr session">
      <section
        aria-live="polite"
        aria-busy="true"
        className="w-full overflow-hidden rounded-3xl border border-primary/20 bg-card/90 p-8 text-center shadow-xl shadow-primary/10 backdrop-blur"
      >
        <BrandMark compact size="lg" className="justify-center" />
        <p className="mt-5 text-sm font-semibold text-foreground">Checking your Renderr session...</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Protected workspace pages will open as soon as authentication is confirmed.
        </p>
      </section>
    </AppShell>
  )
}

export default function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const auth = useAuth() as AuthWithOptionalLoading
  const location = useLocation()
  const loading = Boolean(auth.loading ?? auth.isLoading)

  if (loading) {
    return <ProtectedRouteLoadingState />
  }

  if (!auth.user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  return <>{children}</>
}

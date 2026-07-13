import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import BackNavigation from '@/components/navigation/BackNavigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Sample srcdoc content for demonstration – replace with real data fetching
const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sample Renderr Page</title>
</head>
<body style="font-family:sans-serif;padding:2rem;">
  <h1 style="color:#2563eb;">Hello from srcdoc!</h1>
  <p>This content is rendered inside a secure iframe.</p>
</body>
</html>`

// Simulate fetching srcdoc content
export default function SrcDoc() {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  const fetchContent = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      // Simulate async fetch – replace with real API / Supabase call
      await new Promise((resolve) => setTimeout(resolve, 1200))
      if (!mountedRef.current) return
      setContent(SAMPLE_HTML)
    } catch (err: unknown) {
      if (!mountedRef.current) return
      const message = err instanceof Error ? err.message : 'Failed to load srcdoc content.'
      setError(message)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()

    return () => {
      mountedRef.current = false
    }
  }, [fetchContent])

  return (
    <AppShell maxWidthClassName="max-w-5xl" contentClassName="space-y-6" aria-label="Srcdoc preview">
      {/* Navigation header */}
      <nav className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-card/85 p-5 shadow-xl shadow-primary/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BackNavigation fallbackTo="/" />
          <Link to="/" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <BrandMark subtitle="Srcdoc preview" />
          </Link>
        </div>
        <Button asChild variant="outline" className="rounded-xl bg-background/70">
          <Link to="/">Home</Link>
        </Button>
      </nav>

      {/* Loading state */}
      {loading && (
        <Card className="border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur" aria-busy="true">
          <CardHeader className="p-6 sm:p-8">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="mt-2 h-4 w-96 rounded-xl" />
          </CardHeader>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <Skeleton className="h-[450px] w-full rounded-3xl" />
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {!loading && error && (
        <Card className="border-destructive/40 bg-destructive/10 shadow-xl shadow-primary/10 backdrop-blur">
          <CardContent className="space-y-4 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-destructive">Content could not be loaded</h2>
            <p className="text-sm leading-6 text-muted-foreground">{error}</p>
            <Button type="button" variant="outline" className="rounded-xl bg-background/70" onClick={fetchContent}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && content === null && (
        <Card className="border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
          <CardContent className="p-8 text-center">
            <BrandMark compact size="lg" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold">No content available</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              There is no srcdoc content to display right now.
            </p>
            <Button asChild variant="outline" className="mt-6 rounded-xl">
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content loaded – render iframe */}
      {!loading && !error && content !== null && (
        <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
          <CardContent className="p-6 sm:p-8">
            <iframe
              srcDoc={content}
              title="Rendered srcdoc content"
              sandbox="allow-scripts allow-same-origin"
              className="w-full rounded-2xl border border-primary/15 bg-white"
              style={{ minHeight: '450px', height: '70vh' }}
            />
          </CardContent>
        </Card>
      )}
    </AppShell>
  )
}

import { useCallback } from 'react'
import { useLocation, useNavigate, type To } from 'react-router-dom'

export interface UseBackNavigationOptions {
  /** Safe destination used when browser history is not reliable. */
  fallbackTo: To
  /** Whether fallback navigation should replace the current history entry. */
  replaceFallback?: boolean
}

export interface UseBackNavigationResult {
  /**
   * Navigate to the previous page when in-app history exists, otherwise
   * navigate to the provided fallback destination.
   */
  goBack: () => void
}

/**
 * Small router-aware hook that powers the shared BackNavigation component.
 *
 * It prefers going back through the browser history stack, but falls back to a
 * safe parent route when there is no reliable previous entry (for example when
 * the page was opened directly, from an external link, or as the first entry in
 * the SPA session).
 */
export default function useBackNavigation({
  fallbackTo,
  replaceFallback = false,
}: UseBackNavigationOptions): UseBackNavigationResult {
  const navigate = useNavigate()
  const location = useLocation()

  const goBack = useCallback(() => {
    // react-router increments history.state.idx for each in-app navigation.
    // When idx is greater than 0 we have a previous in-app entry to return to.
    const historyState = (location.state ?? window.history.state) as
      | { idx?: number }
      | null

    const historyIndex =
      typeof window !== 'undefined' &&
      window.history.state &&
      typeof window.history.state.idx === 'number'
        ? (window.history.state.idx as number)
        : historyState?.idx

    const canGoBack = typeof historyIndex === 'number' ? historyIndex > 0 : false

    if (canGoBack) {
      navigate(-1)
      return
    }

    navigate(fallbackTo, { replace: replaceFallback })
  }, [fallbackTo, location.state, navigate, replaceFallback])

  return { goBack }
}

type ManualRouteQaStep = {
  id: string
  route: string
  title: string
  prerequisites: string[]
  actions: string[]
  expected: string[]
}

/**
 * Manual route-level QA checklist for the back-navigation rollout.
 *
 * The current implementation plan requested automated tests only when an
 * existing test setup is available. Because no runner/configuration was present
 * in the supplied project context, this file documents the required route-level
 * checks without introducing new dependencies. These scenarios should be
 * automated once the project standardizes on a test runner.
 */
export const appBackNavigationManualQaChecklist: ManualRouteQaStep[] = [
  {
    id: 'auth-compatibility-redirect-back-fallback',
    route: '/login and /signup',
    title: 'Compatibility auth routes redirect safely and auth back navigation falls back home',
    prerequisites: ['User is signed out.', 'Browser starts from a fresh tab or direct URL entry.'],
    actions: ['Open /login directly.', 'Verify it redirects to /auth?mode=login.', 'Click the Back button on the auth page.', 'Repeat with /signup.'],
    expected: [
      '/login redirects to /auth?mode=login with replace semantics.',
      '/signup redirects to /auth?mode=signup with replace semantics.',
      'BackNavigation on the auth page falls back to / instead of looping through compatibility redirects.',
    ],
  },
  {
    id: 'protected-page-unauthenticated-fallback',
    route: '/dashboard, /profile, /campaigns, /campaigns/new',
    title: 'Protected pages redirect unauthenticated users to auth without breaking fallback navigation',
    prerequisites: ['User is signed out.'],
    actions: ['Open /dashboard directly.', 'Observe redirect to /auth?mode=login.', 'Click BackNavigation on the auth page.'],
    expected: [
      'ProtectedRoute remains the enforcement point and redirects unauthenticated visitors to /auth?mode=login.',
      'BackNavigation on /auth does not send the user into a protected-route redirect loop.',
      'The safe fallback is /.',
    ],
  },
  {
    id: 'protected-page-signed-in-direct-fallback',
    route: '/profile, /campaigns, /campaigns/new, /campaigns/:id/edit',
    title: 'Signed-in direct visits use protected safe fallbacks',
    prerequisites: ['User is signed in.', 'At least one campaign exists for edit/detail checks.'],
    actions: [
      'Open /profile directly and click BackNavigation.',
      'Open /campaigns directly and click BackNavigation.',
      'Open /campaigns/new directly and click BackNavigation.',
      'Open a campaign edit page directly and click BackNavigation.',
    ],
    expected: [
      '/profile falls back to /dashboard.',
      '/campaigns falls back to /dashboard.',
      '/campaigns/new falls back to /campaigns.',
      'Campaign edit/detail owner flows fall back to /campaigns.',
    ],
  },
  {
    id: 'public-page-direct-fallback',
    route: '/fundraisers, /fundraisers/:slug, /status, /project-status',
    title: 'Public pages provide safe direct-entry fallback navigation',
    prerequisites: ['User can be signed in or signed out.', 'At least one published fundraiser exists for detail checks.'],
    actions: [
      'Open /fundraisers directly and use BackNavigation where available.',
      'Open /fundraisers/:slug directly and click BackNavigation.',
      'Open /status or /project-status directly and click BackNavigation.',
    ],
    expected: [
      'Public listing/status pages fall back to /.',
      'Public fundraiser detail pages fall back to /fundraisers.',
      'The existing primary navigation links remain visible and functional.',
    ],
  },
  {
    id: 'in-app-navigation-history',
    route: 'cross-route navigation',
    title: 'BackNavigation prefers real in-app history after normal app navigation',
    prerequisites: ['Use a normal browser session rather than direct URL entry.'],
    actions: [
      'Navigate from / to /fundraisers using the app UI.',
      'Open a fundraiser detail page.',
      'Click BackNavigation.',
      'Navigate from /dashboard to /campaigns/new while signed in and click BackNavigation.',
    ],
    expected: [
      'BackNavigation returns to the previous in-app page when the router history entry is reliable.',
      'If the prior entry is not reliable after refresh/replace redirects, the configured fallback is used.',
      'No protected content is exposed after sign-out; ProtectedRoute continues to redirect as expected.',
    ],
  },
]

export default appBackNavigationManualQaChecklist

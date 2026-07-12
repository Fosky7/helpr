type ManualQaStep = {
  id: string
  title: string
  setup: string
  actions: string[]
  expected: string[]
}

/**
 * Manual QA checklist for BackNavigation.
 *
 * No test runner setup was provided in the available project context, so this
 * file intentionally avoids importing test-only libraries or adding new test
 * dependencies. Convert these cases to automated tests when a project-level
 * runner such as Vitest/Jest and React Testing Library is available.
 */
export const backNavigationManualQaChecklist: ManualQaStep[] = [
  {
    id: 'back-navigation-direct-fallback',
    title: 'Direct visit uses the configured fallback route',
    setup: 'Open a page with BackNavigation directly in a new tab, such as /fundraisers or /status.',
    actions: ['Click the Back button rendered by BackNavigation.'],
    expected: [
      'The app navigates to the page-specific fallback instead of attempting an empty browser back entry.',
      'Public pages fall back to / when configured with fallbackTo="/".',
      'Campaign management pages fall back to /dashboard or /campaigns according to their page context.',
    ],
  },
  {
    id: 'back-navigation-in-app-history',
    title: 'In-app history is preferred when reliable',
    setup: 'Start at /, navigate through an in-app Link to /fundraisers, then open a campaign detail from the listing.',
    actions: ['Click the Back button on the detail page.', 'Click the Back button again from /fundraisers if present.'],
    expected: [
      'The first Back click returns to the previous in-app page rather than the generic fallback.',
      'If no reliable prior in-app entry exists, the component uses the configured fallback route.',
      'The button remains keyboard-focusable and exposes a clear accessible name.',
    ],
  },
  {
    id: 'back-navigation-contextual-state',
    title: 'Contextual route state improves fallback behavior',
    setup: 'Navigate from /dashboard to /campaigns/new or from /campaigns to an edit/detail page using app links that pass state={ from: location.pathname }.',
    actions: ['Refresh the destination page to clear transient navigation history where possible.', 'Click BackNavigation.'],
    expected: [
      'The user is not stranded on a form/detail page after refresh or direct entry.',
      'Create/edit campaign pages safely return to /campaigns.',
      'Profile returns to /dashboard when opened directly.',
    ],
  },
  {
    id: 'back-navigation-unsaved-form-guard',
    title: 'Unsaved campaign forms can block back navigation',
    setup: 'Open /campaigns/new or an existing campaign edit page while signed in.',
    actions: ['Change a form field.', 'Click the BackNavigation button.', 'Cancel the browser confirmation.', 'Click BackNavigation again and confirm leaving.'],
    expected: [
      'Canceling the confirmation keeps the user on the form page.',
      'Confirming the prompt allows navigation to continue.',
      'Saving the form clears the dirty state so BackNavigation no longer prompts unnecessarily.',
    ],
  },
]

export default backNavigationManualQaChecklist

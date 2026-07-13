// Design token constants for consistent visual styling across the app

/**
 * Base card visual treatment without padding.
 * Use this as the default className for the shadcn/ui Card component
 * so every card gets consistent border, background, shadow, and backdrop.
 */
export const cardBase =
  'rounded-3xl border border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur'

/** Standard padding for primary cards. */
export const cardPadding = 'p-6 sm:p-8'

/** Full primary card style (visual + padding). */
export const cardPrimary = `${cardBase} ${cardPadding}`

/** Inner card style for sub-sections (lighter border, subtle shadow). */
export const cardInner =
  'rounded-3xl border border-border bg-background/70 shadow-sm p-5'

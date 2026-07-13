import * as React from 'react'

type SheetSide = 'top' | 'right' | 'bottom' | 'left'

type SheetContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function useSheetContext(componentName: string) {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error(`${componentName} must be used within a Sheet component.`)
  }

  return context
}

type SheetProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Sheet = ({ open, defaultOpen = false, onOpenChange, children }: SheetProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isControlled = open !== undefined
  const currentOpen = isControlled ? Boolean(open) : internalOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) setInternalOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  return <SheetContext.Provider value={{ open: currentOpen, setOpen }}>{children}</SheetContext.Provider>
}

type SheetTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(({ asChild = false, children, onClick, ...props }, ref) => {
  const { open, setOpen } = useSheetContext('SheetTrigger')

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>
    const childOnClick = child.props.onClick as ((event: React.MouseEvent) => void) | undefined

    return React.cloneElement(child, {
      ref,
      'aria-expanded': open,
      onClick: (event: React.MouseEvent) => {
        childOnClick?.(event)
        if (!event.defaultPrevented) setOpen(!open)
      },
    })
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(!open)
      }}
      {...props}
    >
      {children}
    </button>
  )
})
SheetTrigger.displayName = 'SheetTrigger'

type SheetPortalProps = {
  children: React.ReactNode
}

const SheetPortal = ({ children }: SheetPortalProps) => <>{children}</>

type SheetCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(({ asChild = false, children, onClick, ...props }, ref) => {
  const { setOpen } = useSheetContext('SheetClose')

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>
    const childOnClick = child.props.onClick as ((event: React.MouseEvent) => void) | undefined

    return React.cloneElement(child, {
      ref,
      onClick: (event: React.MouseEvent) => {
        childOnClick?.(event)
        if (!event.defaultPrevented) setOpen(false)
      },
    })
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(false)
      }}
      {...props}
    >
      {children}
    </button>
  )
})
SheetClose.displayName = 'SheetClose'

const SheetOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, onClick, ...props }, ref) => {
  const { open, setOpen } = useSheetContext('SheetOverlay')

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cx('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0', className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(false)
      }}
      {...props}
    />
  )
})
SheetOverlay.displayName = 'SheetOverlay'

type SheetContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: SheetSide
}

const sideClasses: Record<SheetSide, string> = {
  top: 'inset-x-0 top-0 border-b rounded-b-3xl',
  right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l',
  bottom: 'inset-x-0 bottom-0 border-t rounded-t-3xl',
  left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r',
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(({ side = 'right', className, children, ...props }, ref) => {
  const { open, setOpen } = useSheetContext('SheetContent')

  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, setOpen])

  if (!open) return null

  return (
    <SheetPortal>
      <SheetOverlay />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cx(
          'fixed z-50 border-primary/20 bg-background/95 p-6 shadow-2xl shadow-primary/20 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-200',
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SheetPortal>
  )
})
SheetContent.displayName = 'SheetContent'

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cx('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cx('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
)
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cx('text-lg font-semibold text-foreground', className)} {...props} />
))
SheetTitle.displayName = 'SheetTitle'

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cx('text-sm text-muted-foreground', className)} {...props} />
))
SheetDescription.displayName = 'SheetDescription'

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

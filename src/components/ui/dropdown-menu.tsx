import * as React from 'react'

type DropdownMenuContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
  contentId: string
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function useDropdownMenuContext(componentName: string) {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error(`${componentName} must be used within a DropdownMenu component.`)
  }

  return context
}

type DropdownMenuProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const DropdownMenu = ({ open, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isControlled = open !== undefined
  const currentOpen = isControlled ? Boolean(open) : internalOpen
  const triggerRef = React.useRef<HTMLElement>(null)
  const reactId = React.useId()
  const contentId = `dropdown-menu-${reactId.replace(/:/g, '')}`

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) setInternalOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  return (
    <DropdownMenuContext.Provider value={{ open: currentOpen, setOpen, triggerRef, contentId }}>
      {children}
    </DropdownMenuContext.Provider>
  )
}

type DropdownMenuTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ asChild = false, children, onClick, ...props }, forwardedRef) => {
    const { open, setOpen, triggerRef, contentId } = useDropdownMenuContext('DropdownMenuTrigger')

    const setRefs = React.useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef, triggerRef],
    )

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>
      const childOnClick = child.props.onClick as ((event: React.MouseEvent) => void) | undefined

      return React.cloneElement(child, {
        ref: setRefs,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': contentId,
        onClick: (event: React.MouseEvent) => {
          childOnClick?.(event)
          if (!event.defaultPrevented) setOpen(!open)
        },
      })
    }

    return (
      <button
        ref={setRefs}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) setOpen(!open)
        }}
        {...props}
      >
        {children}
      </button>
    )
  },
)
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

type DropdownMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'center' | 'end'
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ align = 'end', className, children, onKeyDown, ...props }, ref) => {
    const { open, setOpen, triggerRef, contentId } = useDropdownMenuContext('DropdownMenuContent')
    const contentRef = React.useRef<HTMLDivElement | null>(null)

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        contentRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    React.useEffect(() => {
      if (!open) return

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node
        if (contentRef.current?.contains(target) || triggerRef.current?.contains(target)) return
        setOpen(false)
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return
        setOpen(false)
        triggerRef.current?.focus()
      }

      document.addEventListener('pointerdown', handlePointerDown)
      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('pointerdown', handlePointerDown)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [open, setOpen, triggerRef])

    if (!open) return null

    return (
      <div
        ref={setRefs}
        id={contentId}
        role="menu"
        className={cx(
          'absolute z-50 mt-2 min-w-48 overflow-hidden rounded-2xl border border-primary/20 bg-background/95 p-1 text-foreground shadow-2xl shadow-primary/20 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-200',
          align === 'end' && 'right-0',
          align === 'start' && 'left-0',
          align === 'center' && 'left-1/2 -translate-x-1/2',
          className,
        )}
        onKeyDown={onKeyDown}
        {...props}
      >
        {children}
      </div>
    )
  },
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

type DropdownMenuItemProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean
  inset?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ asChild = false, inset = false, className, children, onClick, ...props }, ref) => {
    const { setOpen } = useDropdownMenuContext('DropdownMenuItem')

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>
      const childOnClick = child.props.onClick as ((event: React.MouseEvent) => void) | undefined

      return React.cloneElement(child, {
        role: 'menuitem',
        className: cx(
          'relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary',
          inset && 'pl-8',
          child.props.className as string | undefined,
        ),
        onClick: (event: React.MouseEvent) => {
          childOnClick?.(event)
          if (!event.defaultPrevented) setOpen(false)
        },
      })
    }

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={0}
        className={cx(
          'relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary',
          inset && 'pl-8',
          className,
        )}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) setOpen(false)
        }}
        {...props}
      >
        {children}
      </div>
    )
  },
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(
  ({ className, inset, ...props }, ref) => (
    <div ref={ref} className={cx('px-3 py-2 text-sm font-semibold text-foreground', inset && 'pl-8', className)} {...props} />
  ),
)
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} role="separator" className={cx('-mx-1 my-1 h-px bg-border', className)} {...props} />
))
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

const DropdownMenuGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div role="group" className={cx('space-y-1', className)} {...props} />
)
DropdownMenuGroup.displayName = 'DropdownMenuGroup'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
}

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined)

const DropdownMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { open?: boolean; onOpenChange?: (open: boolean) => void }
>(({ className, open: controlledOpen, onOpenChange, children, ...props }, ref) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [controlledOpen, onOpenChange])

  const mergedRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el
    },
    [ref]
  )

  // Close when clicking outside
  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const el = containerRef.current
      if (el && !el.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [open, setOpen])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={mergedRef} className={cn("relative inline-flex", className)} {...props}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
})
DropdownMenu.displayName = "DropdownMenu"

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>((props, ref) => {
  const { className, onClick, asChild, children, ...restProps } = props
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu")

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.setOpen(!context.open)
    onClick?.(e)
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; className?: string }>
    return React.cloneElement(child, {
      ...restProps,
      ref,
      onClick: (e: React.MouseEvent) => {
        handleClick(e as React.MouseEvent<HTMLButtonElement>)
        child.props.onClick?.(e)
      },
      className: cn(child.props.className, className),
    } as React.Attributes)
  }

  return (
    <button
      ref={ref}
      className={cn("outline-none", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center';
}

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ className, align = 'end', ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu")

  if (!context.open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full left-0 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50",
        align === 'end' && "left-auto right-0",
        align === 'start' && "right-auto left-0",
        align === 'center' && "left-1/2 right-auto -translate-x-1/2",
        className
      )}
      {...props}
    />
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelect?: () => void
  asChild?: boolean
}

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>((props, ref) => {
  const { className, onSelect, onClick, asChild, children, ...restProps } = props
  const context = React.useContext(DropdownMenuContext)
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onSelect?.()
    onClick?.(e)
    context?.setOpen(false)
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; className?: string }>
    return React.cloneElement(child, {
      ...restProps,
      ref,
      onClick: (e: React.MouseEvent) => {
        handleClick(e as React.MouseEvent<HTMLDivElement>)
        child.props.onClick?.(e)
      },
      className: cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        child.props.className,
        className
      ),
    } as React.Attributes)
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface SheetContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined)

const Sheet = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { open?: boolean; onOpenChange?: (open: boolean) => void }
>(({ className, open: controlledOpen, onOpenChange, children, ...props }, ref) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [controlledOpen, onOpenChange])

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </SheetContext.Provider>
  )
})
Sheet.displayName = "Sheet"

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  SheetTriggerProps
>((props, ref) => {
  const { className, onClick, asChild, children, ...restProps } = props
  const context = React.useContext(SheetContext)
  if (!context) throw new Error("SheetTrigger must be used within Sheet")

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
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
SheetTrigger.displayName = "SheetTrigger"

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" | "top" | "bottom" }
>(({ className, side = "right", children, ...props }, ref) => {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error("SheetContent must be used within Sheet")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!context.open || !mounted) return null

  const content = (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={() => context.setOpen(false)}
        aria-hidden="true"
      />
      <div
        ref={ref}
        className={cn(
          "fixed z-[100] bg-background shadow-2xl transition-transform duration-300 ease-in-out",
          side === "right" && "right-0 top-0 h-full w-full max-w-sm border-l",
          side === "left" && "left-0 top-0 h-full w-full max-w-sm border-r",
          side === "top" && "top-0 left-0 w-full border-b",
          side === "bottom" && "bottom-0 left-0 w-full border-t",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </>
  )

  return createPortal(content, document.body)
})
SheetContent.displayName = "SheetContent"

export { Sheet, SheetTrigger, SheetContent }

"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const Dialog = React.createContext()

const DialogProvider = ({ children, open, onOpenChange, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(open || false)

  // Sincronizar el estado interno con el prop open
  React.useEffect(() => {
    setIsOpen(open || false)
  }, [open])

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <Dialog.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      <div {...props}>{children}</div>
    </Dialog.Provider>
  )
}

const DialogTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(Dialog)

  return (
    <button ref={ref} onClick={() => context?.onOpenChange(true)} className={className} {...props}>
      {children}
    </button>
  )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(Dialog)

  if (!context?.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => context?.onOpenChange(false)} />
      <div
        ref={ref}
        className={cn(
          "relative z-50 grid w-full max-w-lg gap-3 sm:gap-4 border bg-background p-4 sm:p-6 shadow-lg duration-200 rounded-lg sm:rounded-lg max-h-[90vh] overflow-y-auto",
          className,
        )}
        {...props}
      >
        {children}
        <button
          className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-1"
          onClick={() => context?.onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
DialogDescription.displayName = "DialogDescription"

export { DialogProvider as Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger }

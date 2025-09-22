"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "../../lib/utils"

const Select = React.createContext()

const SelectProvider = ({ children, value, onValueChange, ...props }) => {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <Select.Provider value={{ open, setOpen, value: selectedValue, onValueChange: handleValueChange }}>
      <div {...props}>{children}</div>
    </Select.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(Select)

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={() => context?.setOpen(!context.open)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, className, ...props }) => {
  const context = React.useContext(Select)

  return (
    <span className={cn("block truncate", className)} {...props}>
      {context?.value || placeholder}
    </span>
  )
}

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(Select)

  if (!context?.open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
        className,
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(Select)

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      onClick={() => context?.onValueChange(value)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {context?.value === value && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { SelectProvider as Select, SelectContent, SelectItem, SelectTrigger, SelectValue }

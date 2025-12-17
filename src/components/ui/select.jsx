"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "../../lib/utils"

const Select = React.createContext()

// Variable global para rastrear qué select está abierto
let openSelectRef = null

const SelectProvider = ({ children, value, onValueChange, ...props }) => {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")
  const containerRef = React.useRef(null)
  const setOpenRef = React.useRef(null)

  React.useEffect(() => {
    setSelectedValue(value || "")
  }, [value])

  React.useEffect(() => {
    setOpenRef.current = setOpen
  }, [])

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
        if (openSelectRef === setOpenRef) {
          openSelectRef = null
        }
      }
    }

    if (open) {
      // Cerrar otros selects abiertos
      if (openSelectRef && openSelectRef !== setOpenRef && openSelectRef.current) {
        openSelectRef.current(false)
      }
      openSelectRef = setOpenRef
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      if (openSelectRef === setOpenRef) {
        openSelectRef = null
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen)
  }

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
    if (openSelectRef === setOpenRef) {
      openSelectRef = null
    }
  }

  return (
    <Select.Provider value={{ open, setOpen: handleOpenChange, value: selectedValue, onValueChange: handleValueChange }}>
      <div className="relative" ref={containerRef} {...props}>{children}</div>
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
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        className,
      )}
      onClick={() => context?.setOpen(!context.open)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 text-gray-400" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, className, children, ...props }) => {
  const context = React.useContext(Select)

  return (
    <span className={cn("block truncate", className)} {...props}>
      {children !== undefined ? children : (context?.value || placeholder)}
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
        "absolute top-full left-0 mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg",
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
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2.5 px-3 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50 transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      onClick={() => context?.onValueChange(value)}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { SelectProvider as Select, SelectContent, SelectItem, SelectTrigger, SelectValue }

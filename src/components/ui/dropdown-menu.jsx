import * as React from "react"
import { cn } from "../../lib/utils"

const DropdownMenuContext = React.createContext({})

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = ({ asChild, children, className }) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext)
  
  if (asChild && React.isValidElement(children)) {
     return React.cloneElement(children, {
         onClick: (e) => {
             e.stopPropagation() 
             if(children.props.onClick) children.props.onClick(e);
             setOpen(!open)
         },
         className: cn(children.props.className, className)
     })
  }
  
  return (
      <button onClick={() => setOpen(!open)} className={className}>
          {children}
      </button>
  )
}

const DropdownMenuContent = ({ children, className, align="end" }) => {
    const { open } = React.useContext(DropdownMenuContext)
    if (!open) return null
    
    return (
        <div className={cn(
            "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-slate-950 shadow-md",
            align === "end" ? "right-0" : "left-0",
            "mt-2", 
            className
        )}>
            {children}
        </div>
    )
}

const DropdownMenuItem = ({ children, className, ...props }) => {
    return (
        <div className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
            {children}
        </div>
    )
}

const DropdownMenuLabel = ({ children, className, ...props }) => {
    return <div className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props}>{children}</div>
}

const DropdownMenuSeparator = ({ className, ...props }) => {
    return <div className={cn("-mx-1 my-1 h-px bg-slate-100", className)} {...props} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}

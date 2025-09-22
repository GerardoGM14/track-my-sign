"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

const SidebarContext = React.createContext()

const SidebarProvider = ({ children, className, ...props }) => {
  const [open, setOpen] = React.useState(true)

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className={cn("flex min-h-screen", className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

const Sidebar = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(SidebarContext)

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-64 flex-col border-r bg-background transition-all duration-300",
        !context?.open && "w-16",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-14 items-center border-b px-4", className)} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 overflow-auto py-2", className)} {...props} />
))
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-3 py-2", className)} {...props} />
))
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-4 py-2 text-xs font-semibold text-muted-foreground", className)} {...props} />
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-1", className)} {...props} />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("space-y-1", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef(({ className, asChild, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarInset = React.forwardRef(({ className, ...props }, ref) => (
  <main ref={ref} className={cn("flex flex-1 flex-col", className)} {...props} />
))
SidebarInset.displayName = "SidebarInset"

const SidebarSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mx-3 my-1 h-px bg-border", className)} {...props} />
))
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center border-t px-4 py-3", className)} {...props} />
))
SidebarFooter.displayName = "SidebarFooter"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter, // agregando SidebarFooter a las exportaciones
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
}

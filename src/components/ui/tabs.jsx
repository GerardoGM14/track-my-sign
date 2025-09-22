"use client"

import React, { useState, createContext, useContext } from "react"
import { cn } from "../../lib/utils"

// Context para manejar el estado de las tabs
const TabsContext = createContext()

// Componente principal Tabs
export const Tabs = ({ defaultValue, value, onValueChange, children, className, ...props }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value)

  const handleTabChange = (newValue) => {
    setActiveTab(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  const contextValue = {
    activeTab: value || activeTab,
    onTabChange: handleTabChange,
  }

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

// Lista de triggers/botones de tabs
export const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500", className)}
    {...props}
  />
))
TabsList.displayName = "TabsList"

// Trigger individual de cada tab
export const TabsTrigger = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { activeTab, onTabChange } = useContext(TabsContext)
  const isActive = activeTab === value

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900",
        className,
      )}
      onClick={() => onTabChange(value)}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

// Contenido de cada tab
export const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { activeTab } = useContext(TabsContext)

  if (activeTab !== value) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

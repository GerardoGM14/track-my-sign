"use client"

import { useState, useEffect } from "react"
import { cn } from "../../lib/utils"

const Toast = ({ toast, onDismiss }) => {
  const variantStyles = {
    default: "bg-white border-gray-200 text-gray-900",
    destructive: "bg-red-50 border-red-200 text-red-900",
    success: "bg-green-50 border-green-200 text-green-900",
  }

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
        "animate-in slide-in-from-top-full duration-300",
        variantStyles[toast.variant] || variantStyles.default,
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            {toast.title && <p className="text-sm font-medium">{toast.title}</p>}
            {toast.description && <p className="mt-1 text-sm opacity-90">{toast.description}</p>}
          </div>
          <button onClick={() => onDismiss(toast.id)} className="ml-4 inline-flex text-gray-400 hover:text-gray-600">
            <span className="sr-only">Cerrar</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export const Toaster = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleToast = (event) => {
      const { title, description, variant } = event.detail
      const id = Math.random().toString(36).substr(2, 9)
      const newToast = { id, title, description, variant, createdAt: Date.now() }

      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    }

    window.addEventListener("show-toast", handleToast)
    return () => window.removeEventListener("show-toast", handleToast)
  }, [])

  const dismiss = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  )
}

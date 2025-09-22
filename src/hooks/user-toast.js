"use client"

import { useState, useCallback } from "react"

// Sistema de toast simple sin dependencias externas
export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, variant = "default" }) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = {
      id,
      title,
      description,
      variant,
      createdAt: Date.now(),
    }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)

    return {
      id,
      dismiss: () => setToasts((prev) => prev.filter((t) => t.id !== id)),
    }
  }, [])

  const dismiss = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }, [])

  return {
    toast,
    dismiss,
    toasts,
  }
}

// Hook para usar en componentes
export const toast = ({ title, description, variant = "default" }) => {
  // Crear evento personalizado para manejar toasts globalmente
  const event = new CustomEvent("show-toast", {
    detail: { title, description, variant },
  })
  window.dispatchEvent(event)
}

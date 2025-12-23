"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export function LoadingSpinner({ 
  texto = "Cargando...", 
  delay = 1500,
  mostrarTexto = true,
  tamaño = "md"
}) {
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    // Mostrar el spinner después del delay mínimo
    const timer = setTimeout(() => {
      setMostrar(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!mostrar) {
    return null
  }

  const tamaños = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        <Loader2 className={`${tamaños[tamaño]} animate-spin text-blue-600`} />
      </div>
      {mostrarTexto && (
        <p className="text-sm sm:text-base text-gray-600 font-medium">{texto}</p>
      )}
    </div>
  )
}

// Componente para loading overlay (pantalla completa)
export function LoadingOverlay({ 
  texto = "Cargando...", 
  delay = 1500,
  mostrarTexto = true 
}) {
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrar(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!mostrar) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        {mostrarTexto && (
          <p className="text-base sm:text-lg text-gray-700 font-medium">{texto}</p>
        )}
      </div>
    </div>
  )
}


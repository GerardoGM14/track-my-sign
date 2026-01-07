"use client"

import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

export function RouteLoader() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    // Cuando cambia la ruta, mostrar el loader
    setIsNavigating(true)
    setLoading(true)

    // Tiempo mínimo de visualización para evitar parpadeos (aumentado para mejor UX)
    const minDisplayTimer = setTimeout(() => {
      setLoading(false)
    }, 500)

    // Tiempo máximo para ocultar el loader (por si acaso)
    const maxDisplayTimer = setTimeout(() => {
      setIsNavigating(false)
      setLoading(false)
    }, 2000)

    return () => {
      clearTimeout(minDisplayTimer)
      clearTimeout(maxDisplayTimer)
    }
  }, [location.pathname])

  // Ocultar completamente después de la animación
  useEffect(() => {
    if (!loading && isNavigating) {
      const hideTimer = setTimeout(() => {
        setIsNavigating(false)
      }, 300) // Tiempo de la transición CSS

      return () => clearTimeout(hideTimer)
    }
  }, [loading, isNavigating])

  if (!isNavigating) {
    return null
  }

  // Generar 12 puntos para el loader circular
  const puntos = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div 
      className={`fixed inset-0 bg-slate-800/70 backdrop-blur-md z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        loading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Loader circular con puntos rotando */}
        <div className="relative w-24 h-24">
          <style>{`
            @keyframes rotate-dots {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            .rotating-container {
              animation: rotate-dots 1s linear infinite;
            }
          `}</style>
          
          {/* Contenedor que rota */}
          <div className="absolute inset-0 rotating-container">
            {puntos.map((index) => {
              // Calcular posición de cada punto en el círculo
              const angle = (index * 360) / 12 - 90 // -90 para empezar arriba
              const radius = 36 // Radio del círculo
              const x = Math.cos((angle * Math.PI) / 180) * radius
              const y = Math.sin((angle * Math.PI) / 180) * radius
              
              // Crear efecto de gradiente donde algunos puntos son más brillantes
              // Simulamos que los primeros 3-4 puntos son los más brillantes
              const distanciaDesdeInicio = index < 4 ? index : (12 - index + 4) % 12
              const opacity = Math.max(0.2, 1 - (distanciaDesdeInicio * 0.15))
              const scale = 0.8 + (opacity * 0.4)
              
              return (
                <div
                  key={index}
                  className="absolute rounded-full"
                  style={{
                    width: '10px',
                    height: '10px',
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    background: `rgba(96, 165, 250, ${opacity})`, // blue-400 con opacidad variable
                    boxShadow: opacity > 0.7 ? `0 0 8px rgba(96, 165, 250, ${opacity * 0.8})` : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              )
            })}
          </div>
        </div>
        
        {/* Texto de carga */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm sm:text-base text-white/90 font-medium">
            Cargando...
          </p>
        </div>
      </div>
    </div>
  )
}


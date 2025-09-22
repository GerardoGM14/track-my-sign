"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"

export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const navigate = useNavigate()

  const navigateWithTransition = useCallback(
    (to, options = {}) => {
      setIsTransitioning(true)

      // Esperar a que termine el fade out antes de navegar
      setTimeout(() => {
        navigate(to, options)
        // Resetear el estado después de navegar
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 400) // Duración del fade out
    },
    [navigate],
  )

  return { isTransitioning, navigateWithTransition }
}

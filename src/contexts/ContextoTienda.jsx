"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoAuth } from "./ContextoAuth"

const ContextoTienda = createContext(undefined)

export function useContextoTienda() {
  const contexto = useContext(ContextoTienda)
  if (contexto === undefined) {
    throw new Error("useContextoTienda debe ser usado dentro de un ProveedorTienda")
  }
  return contexto
}

export function ProveedorTienda({ children }) {
  const [tiendaActual, setTiendaActual] = useState(null)
  const [cargando, setCargando] = useState(false)
  const { usuarioActual } = useContextoAuth()

  const establecerTiendaPorSlug = async (slug) => {
    setCargando(true)
    try {
      // En una app real, consultarías por slug. Por ahora, usamos el slug como ID de tienda
      const docTienda = await getDoc(doc(db, "tiendas", slug))
      if (docTienda.exists()) {
        setTiendaActual({ id: docTienda.id, ...docTienda.data() })
      } else {
        setTiendaActual(null)
      }
    } catch (error) {
      console.error("Error obteniendo tienda:", error)
      setTiendaActual(null)
    } finally {
      setCargando(false)
    }
  }

  // Auto-cargar tienda si el usuario tiene un tiendaId
  useEffect(() => {
    if (usuarioActual?.tiendaId) {
      establecerTiendaPorSlug(usuarioActual.tiendaId)
    }
  }, [usuarioActual])

  const valor = {
    tiendaActual,
    cargando,
    establecerTiendaPorSlug,
  }

  return <ContextoTienda.Provider value={valor}>{children}</ContextoTienda.Provider>
}

export { useContextoTienda as useTienda }

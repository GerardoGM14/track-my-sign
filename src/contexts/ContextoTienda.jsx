"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
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
        // Si la tienda no existe en Firebase, verificar si es un usuario mock
        // En desarrollo, crear la tienda en Firebase para que Storage funcione
        if (usuarioActual?.id === "mock-admin-uid" || usuarioActual?.id === "mock-customer-uid") {
          console.log("Usuario mock detectado, creando tienda en Firebase:", slug)
          const tiendaMock = {
            nombre: "Tienda Demo",
            slug: slug,
            planId: "professional",
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
            activa: true,
          }
          // Crear la tienda en Firebase
          try {
            await setDoc(doc(db, "tiendas", slug), tiendaMock)
            setTiendaActual({ id: slug, ...tiendaMock })
            console.log("Tienda mock creada exitosamente en Firebase")
          } catch (errorCrear) {
            console.error("Error creando tienda mock en Firebase:", errorCrear)
            // Si falla crear en Firebase, usar tienda mock local
            setTiendaActual({ id: slug, ...tiendaMock })
          }
        } else {
          setTiendaActual(null)
        }
      }
    } catch (error) {
      console.error("Error obteniendo tienda:", error)
      // Si hay un error y es un usuario mock, crear tienda mock local
      if (usuarioActual?.id === "mock-admin-uid" || usuarioActual?.id === "mock-customer-uid") {
        console.log("Error cargando tienda, pero es usuario mock. Creando tienda mock local")
        const tiendaMock = {
          id: slug,
          nombre: "Tienda Demo",
          slug: slug,
          planId: "professional",
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          activa: true,
        }
        setTiendaActual(tiendaMock)
      } else {
        setTiendaActual(null)
      }
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

"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

const ContextoAuth = createContext(undefined)

export function useContextoAuth() {
  const contexto = useContext(ContextoAuth)
  if (contexto === undefined) {
    throw new Error("useContextoAuth debe ser usado dentro de un ProveedorAuth")
  }
  return contexto
}

export const useAuth = useContextoAuth

export function ProveedorAuth({ children }) {
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [usuarioFirebase, setUsuarioFirebase] = useState(null)
  const [cargando, setCargando] = useState(true)

  const proveedorGoogle = new GoogleAuthProvider()

  const iniciarSesion = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const iniciarSesionConGoogle = async () => {
    const resultado = await signInWithPopup(auth, proveedorGoogle)
    const usuario = resultado.user

    // Verificar si el usuario ya existe en Firestore
    const docUsuario = await getDoc(doc(db, "usuarios", usuario.uid))

    if (!docUsuario.exists()) {
      // Si es nuevo usuario, crear documento básico
      const nuevoUsuario = {
        id: usuario.uid,
        email: usuario.email,
        nombre: usuario.displayName || "",
        rol: "admin", // Por defecto todos los registros son Admin/Shop Owner
        tiendaId: null, // Se asignará después del onboarding
        planId: localStorage.getItem("planSeleccionado") || "professional",
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        configuracionCompleta: false,
      }

      await setDoc(doc(db, "usuarios", usuario.uid), nuevoUsuario)
    }

    return resultado
  }

  const registrar = async (email, password, datosUsuario) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    const nuevoUsuario = {
      id: user.uid,
      email: user.email,
      nombre: datosUsuario.nombre || "",
      rol: "admin", // Siempre Admin/Shop Owner en registro
      tiendaId: null, // Se creará durante onboarding
      planId: datosUsuario.planId || localStorage.getItem("planSeleccionado") || "professional",
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      configuracionCompleta: false,
      // Datos adicionales para el SaaS
      empresa: datosUsuario.empresa || "",
      telefono: datosUsuario.telefono || "",
      direccion: datosUsuario.direccion || "",
    }

    await setDoc(doc(db, "usuarios", user.uid), nuevoUsuario)
  }

  const cerrarSesion = async () => {
    await signOut(auth)
  }

  const tienePermiso = (permisoRequerido) => {
    if (!usuarioActual) return false

    const permisosPorRol = {
      superadmin: ["*"], // Todos los permisos
      admin: ["gestionar_tienda", "gestionar_empleados", "ver_reportes", "gestionar_clientes"],
      employee: ["gestionar_clientes", "crear_cotizaciones", "gestionar_ordenes"],
      customer: ["ver_cotizaciones", "ver_ordenes"],
    }

    const permisosUsuario = permisosPorRol[usuarioActual.rol] || []
    return permisosUsuario.includes("*") || permisosUsuario.includes(permisoRequerido)
  }

  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, async (usuarioFirebase) => {
      setUsuarioFirebase(usuarioFirebase)

      if (usuarioFirebase) {
        // Obtener datos del usuario desde Firestore
        const docUsuario = await getDoc(doc(db, "usuarios", usuarioFirebase.uid))
        if (docUsuario.exists()) {
          setUsuarioActual(docUsuario.data())
        }
      } else {
        setUsuarioActual(null)
      }

      setCargando(false)
    })

    return desuscribir
  }, [])

  const valor = {
    usuarioActual,
    usuarioFirebase,
    cargando,
    iniciarSesion,
    iniciarSesionConGoogle, // Agregando método de Google
    registrar,
    cerrarSesion,
    tienePermiso, // Agregando función de permisos
    usuario: usuarioActual,
  }

  return <ContextoAuth.Provider value={valor}>{!cargando && children}</ContextoAuth.Provider>
}

"use client"

import { useState, useEffect } from "react"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { useContextoAuth } from "../contexts/ContextoAuth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { toast } from "../hooks/user-toast"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import { 
  Settings, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Globe,
  Bell,
  CreditCard,
  FileText,
  Image as ImageIcon
} from "lucide-react"

export default function PaginaConfiguracion() {
  const { tiendaActual } = useContextoTienda()
  const { usuarioActual } = useContextoAuth()
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [configuracion, setConfiguracion] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    pais: "",
    sitioWeb: "",
    logo: "",
    moneda: "EUR",
    idioma: "es",
    zonaHoraria: "Europe/Madrid",
    notificacionesEmail: true,
    notificacionesSMS: false,
  })

  useEffect(() => {
    if (tiendaActual) {
      cargarConfiguracion()
    }
  }, [tiendaActual])

  const cargarConfiguracion = async () => {
    try {
      setCargando(true)
      if (tiendaActual) {
        const configRef = doc(db, "tiendas", tiendaActual.id, "configuracion", "general")
        const configSnap = await getDoc(configRef)

        if (configSnap.exists()) {
          const datos = configSnap.data()
          setConfiguracion({
            nombre: datos.nombre || tiendaActual.nombre || "",
            email: datos.email || usuarioActual?.email || "",
            telefono: datos.telefono || usuarioActual?.telefono || "",
            direccion: datos.direccion || usuarioActual?.direccion || "",
            ciudad: datos.ciudad || "",
            codigoPostal: datos.codigoPostal || "",
            pais: datos.pais || "España",
            sitioWeb: datos.sitioWeb || "",
            logo: datos.logo || "",
            moneda: datos.moneda || "EUR",
            idioma: datos.idioma || "es",
            zonaHoraria: datos.zonaHoraria || "Europe/Madrid",
            notificacionesEmail: datos.notificacionesEmail !== undefined ? datos.notificacionesEmail : true,
            notificacionesSMS: datos.notificacionesSMS !== undefined ? datos.notificacionesSMS : false,
          })
        } else {
          // Valores por defecto si no existe configuración
          setConfiguracion({
            nombre: tiendaActual.nombre || "",
            email: usuarioActual?.email || "",
            telefono: usuarioActual?.telefono || "",
            direccion: usuarioActual?.direccion || "",
            ciudad: "",
            codigoPostal: "",
            pais: "España",
            sitioWeb: "",
            logo: "",
            moneda: "EUR",
            idioma: "es",
            zonaHoraria: "Europe/Madrid",
            notificacionesEmail: true,
            notificacionesSMS: false,
          })
        }
      }
    } catch (error) {
      console.error("Error cargando configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()
    try {
      setGuardando(true)
      if (tiendaActual) {
        const configRef = doc(db, "tiendas", tiendaActual.id, "configuracion", "general")
        await setDoc(configRef, {
          ...configuracion,
          fechaActualizacion: new Date(),
          actualizadoPor: usuarioActual?.nombre || usuarioActual?.email || "admin",
        }, { merge: true })

        // También actualizar el nombre de la tienda si cambió
        if (configuracion.nombre && configuracion.nombre !== tiendaActual.nombre) {
          const tiendaRef = doc(db, "tiendas", tiendaActual.id)
          await setDoc(tiendaRef, { nombre: configuracion.nombre }, { merge: true })
        }

        toast({
          title: "Configuración guardada",
          description: "La configuración se ha guardado correctamente",
        })
      }
    } catch (error) {
      console.error("Error guardando configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 min-h-full px-18">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Configuración</h1>
          <p className="text-sm text-gray-600 mt-1 leading-tight">Gestiona la configuración de tu tienda</p>
        </div>
      </div>

      <form onSubmit={manejarSubmit} className="space-y-6">
        {/* Información de la Empresa */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Información de la Empresa</CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-600 leading-tight">
              Datos básicos de tu empresa o tienda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                  Nombre de la Empresa
                </Label>
                <Input
                  id="nombre"
                  value={configuracion.nombre}
                  onChange={(e) => setConfiguracion({ ...configuracion, nombre: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={configuracion.email}
                  onChange={(e) => setConfiguracion({ ...configuracion, email: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  value={configuracion.telefono}
                  onChange={(e) => setConfiguracion({ ...configuracion, telefono: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sitioWeb" className="text-sm font-medium text-gray-700">
                  Sitio Web
                </Label>
                <Input
                  id="sitioWeb"
                  type="url"
                  value={configuracion.sitioWeb}
                  onChange={(e) => setConfiguracion({ ...configuracion, sitioWeb: e.target.value })}
                  className="mt-1"
                  placeholder="https://"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dirección */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Dirección</CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-600 leading-tight">
              Información de ubicación de tu empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">
                Dirección
              </Label>
              <Input
                id="direccion"
                value={configuracion.direccion}
                onChange={(e) => setConfiguracion({ ...configuracion, direccion: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ciudad" className="text-sm font-medium text-gray-700">
                  Ciudad
                </Label>
                <Input
                  id="ciudad"
                  value={configuracion.ciudad}
                  onChange={(e) => setConfiguracion({ ...configuracion, ciudad: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="codigoPostal" className="text-sm font-medium text-gray-700">
                  Código Postal
                </Label>
                <Input
                  id="codigoPostal"
                  value={configuracion.codigoPostal}
                  onChange={(e) => setConfiguracion({ ...configuracion, codigoPostal: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pais" className="text-sm font-medium text-gray-700">
                  País
                </Label>
                <Input
                  id="pais"
                  value={configuracion.pais}
                  onChange={(e) => setConfiguracion({ ...configuracion, pais: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración General */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Configuración General</CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-600 leading-tight">
              Preferencias y ajustes del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="moneda" className="text-sm font-medium text-gray-700">
                  Moneda
                </Label>
                <Input
                  id="moneda"
                  value={configuracion.moneda}
                  onChange={(e) => setConfiguracion({ ...configuracion, moneda: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="idioma" className="text-sm font-medium text-gray-700">
                  Idioma
                </Label>
                <Input
                  id="idioma"
                  value={configuracion.idioma}
                  onChange={(e) => setConfiguracion({ ...configuracion, idioma: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="zonaHoraria" className="text-sm font-medium text-gray-700">
                  Zona Horaria
                </Label>
                <Input
                  id="zonaHoraria"
                  value={configuracion.zonaHoraria}
                  onChange={(e) => setConfiguracion({ ...configuracion, zonaHoraria: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Notificaciones</CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-600 leading-tight">
              Configura cómo recibes las notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <Label htmlFor="notificacionesEmail" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Notificaciones por Email
                  </Label>
                  <p className="text-xs text-gray-500">Recibe notificaciones importantes por correo electrónico</p>
                </div>
              </div>
              <input
                type="checkbox"
                id="notificacionesEmail"
                checked={configuracion.notificacionesEmail}
                onChange={(e) => setConfiguracion({ ...configuracion, notificacionesEmail: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <Label htmlFor="notificacionesSMS" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Notificaciones por SMS
                  </Label>
                  <p className="text-xs text-gray-500">Recibe notificaciones importantes por mensaje de texto</p>
                </div>
              </div>
              <input
                type="checkbox"
                id="notificacionesSMS"
                checked={configuracion.notificacionesSMS}
                onChange={(e) => setConfiguracion({ ...configuracion, notificacionesSMS: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botón de Guardar */}
        <div className="flex justify-end gap-3">
          <Button 
            type="submit" 
            disabled={guardando}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {guardando ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </div>
      </form>
    </div>
  )
}


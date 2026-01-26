"use client"

import { useState, useEffect, useRef } from "react"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { useContextoAuth } from "../contexts/ContextoAuth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { toast } from "../hooks/user-toast"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
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
  Image as ImageIcon,
  Key,
  Search,
  Check,
  ChevronDown
} from "lucide-react"

const DATOS_REGIONALES = {
  "Alemania": { moneda: "EUR", idioma: "de", zonaHoraria: "Europe/Berlin" },
  "Argentina": { moneda: "ARS", idioma: "es-AR", zonaHoraria: "America/Argentina/Buenos_Aires" },
  "Bolivia": { moneda: "BOB", idioma: "es-BO", zonaHoraria: "America/La_Paz" },
  "Chile": { moneda: "CLP", idioma: "es-CL", zonaHoraria: "America/Santiago" },
  "Colombia": { moneda: "COP", idioma: "es-CO", zonaHoraria: "America/Bogota" },
  "Costa Rica": { moneda: "CRC", idioma: "es-CR", zonaHoraria: "America/Costa_Rica" },
  "Ecuador": { moneda: "USD", idioma: "es-EC", zonaHoraria: "America/Guayaquil" },
  "España": { moneda: "EUR", idioma: "es-ES", zonaHoraria: "Europe/Madrid" },
  "Estados Unidos": { moneda: "USD", idioma: "en-US", zonaHoraria: "America/New_York" },
  "Francia": { moneda: "EUR", idioma: "fr-FR", zonaHoraria: "Europe/Paris" },
  "Italia": { moneda: "EUR", idioma: "it-IT", zonaHoraria: "Europe/Rome" },
  "México": { moneda: "MXN", idioma: "es-MX", zonaHoraria: "America/Mexico_City" },
  "Panamá": { moneda: "USD", idioma: "es-PA", zonaHoraria: "America/Panama" },
  "Paraguay": { moneda: "PYG", idioma: "es-PY", zonaHoraria: "America/Asuncion" },
  "Perú": { moneda: "PEN", idioma: "es-PE", zonaHoraria: "America/Lima" },
  "Portugal": { moneda: "EUR", idioma: "pt-PT", zonaHoraria: "Europe/Lisbon" },
  "Puerto Rico": { moneda: "USD", idioma: "es-PR", zonaHoraria: "America/Puerto_Rico" },
  "Reino Unido": { moneda: "GBP", idioma: "en-GB", zonaHoraria: "Europe/London" },
  "República Dominicana": { moneda: "DOP", idioma: "es-DO", zonaHoraria: "America/Santo_Domingo" },
  "Uruguay": { moneda: "UYU", idioma: "es-UY", zonaHoraria: "America/Montevideo" },
  "Venezuela": { moneda: "VES", idioma: "es-VE", zonaHoraria: "America/Caracas" }
}

const PAISES = Object.keys(DATOS_REGIONALES).sort()

const SelectorPais = ({ value, onChange, paises }) => {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setAbierto(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [wrapperRef])

  useEffect(() => {
    if (abierto && inputRef.current) {
      inputRef.current.focus()
    }
    if (!abierto) {
        setBusqueda("")
    }
  }, [abierto])

  const paisesFiltrados = busqueda === ""
    ? []
    : paises.filter((pais) =>
        pais.toLowerCase().includes(busqueda.toLowerCase())
      )

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className={`flex h-8 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 hover:border-indigo-300 cursor-pointer transition-all ${abierto ? 'rounded-b-none border-b-0' : ''}`}
        onClick={() => setAbierto(!abierto)}
      >
        <span className={!value ? "text-gray-500" : "font-medium"}>
          {value || "Selecciona un país"}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`} />
      </div>

      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          abierto ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="w-full rounded-b-md border border-gray-200 border-t-0 bg-white text-gray-900 shadow-sm">
            <div className="flex items-center border-b border-gray-100 px-3 py-2 bg-gray-50/50">
              <Search className="mr-2 h-3.5 w-3.5 text-gray-400" />
              <input
                ref={inputRef}
                className="flex h-5 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-gray-400"
                placeholder="Escribe para buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
              {busqueda === "" ? (
                <div className="py-4 px-2 text-xs text-gray-500 text-center flex flex-col items-center justify-center gap-1">
                  <Search className="h-4 w-4 opacity-50" />
                  <span>Escribe para buscar...</span>
                </div>
              ) : paisesFiltrados.length === 0 ? (
                <div className="py-2.5 px-2 text-xs text-gray-500 text-center">
                  No se encontró "{busqueda}"
                </div>
              ) : (
                paisesFiltrados.map((pais) => (
                  <div
                    key={pais}
                    className={`relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-xs outline-none transition-colors ${
                      value === pais 
                        ? "bg-indigo-50 text-indigo-700 font-medium" 
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      onChange(pais)
                      setAbierto(false)
                      setBusqueda("")
                    }}
                  >
                    <span className="flex-1 truncate">{pais}</span>
                    {value === pais && (
                      <Check className="ml-auto h-3.5 w-3.5 text-indigo-600" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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

  const [configuracionStripe, setConfiguracionStripe] = useState({
    activo: false,
    publishableKey: "",
    secretKey: "",
    webhookEndpoint: ""
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
        // Cargar configuración general
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

        // Cargar configuración de Stripe
        const stripeRef = doc(db, "tiendas", tiendaActual.id, "configuracion", "stripe")
        const stripeSnap = await getDoc(stripeRef)

        if (stripeSnap.exists()) {
          const datosStripe = stripeSnap.data()
          setConfiguracionStripe({
            activo: datosStripe.activo || false,
            publishableKey: datosStripe.publishableKey || "",
            secretKey: datosStripe.secretKey || "",
            webhookEndpoint: datosStripe.webhookEndpoint || ""
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
        // Guardar configuración general
        const configRef = doc(db, "tiendas", tiendaActual.id, "configuracion", "general")
        await setDoc(configRef, {
          ...configuracion,
          fechaActualizacion: new Date(),
          actualizadoPor: usuarioActual?.nombre || usuarioActual?.email || "admin",
        }, { merge: true })

        // Guardar configuración de Stripe
        const stripeRef = doc(db, "tiendas", tiendaActual.id, "configuracion", "stripe")
        await setDoc(stripeRef, {
          ...configuracionStripe,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configuración</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona la información de tu empresa y preferencias del sistema.</p>
        </div>
        <Button 
          onClick={manejarSubmit}
          disabled={guardando}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow-md h-9 px-4 rounded-lg text-sm"
        >
          <Save className="mr-2 h-4 w-4" />
          {guardando ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <form onSubmit={manejarSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Información de la Empresa */}
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 border-t-4 border-t-blue-500">
              <div className="px-4 py-2 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg shadow-sm">
                    <Building2 className="h-4 w-4 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Información de la Empresa</h2>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="nombre" className="text-xs font-medium text-gray-700">Nombre de la Empresa</Label>
                      <Input
                        id="nombre"
                        value={configuracion.nombre}
                        onChange={(e) => setConfiguracion({ ...configuracion, nombre: e.target.value })}
                        className="h-8 bg-white border-gray-200 hover:border-blue-300 focus:bg-blue-50/20 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm rounded-md text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs font-medium text-gray-700">Email de Contacto</Label>
                      <Input
                        id="email"
                        type="email"
                        value={configuracion.email}
                        onChange={(e) => setConfiguracion({ ...configuracion, email: e.target.value })}
                        className="h-8 bg-white border-gray-200 hover:border-blue-300 focus:bg-blue-50/20 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm rounded-md text-xs"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="telefono" className="text-xs font-medium text-gray-700">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={configuracion.telefono}
                        onChange={(e) => setConfiguracion({ ...configuracion, telefono: e.target.value })}
                        className="h-8 bg-white border-gray-200 hover:border-blue-300 focus:bg-blue-50/20 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm rounded-md text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sitioWeb" className="text-xs font-medium text-gray-700">Sitio Web</Label>
                      <div className="relative group">
                        <Globe className="absolute left-2.5 top-2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="sitioWeb"
                          type="url"
                          value={configuracion.sitioWeb}
                          onChange={(e) => setConfiguracion({ ...configuracion, sitioWeb: e.target.value })}
                          className="pl-8 h-8 bg-white border-gray-200 hover:border-blue-300 focus:bg-blue-50/20 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm rounded-md text-xs"
                          placeholder="https://"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ubicación y Mapa */}
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 border-t-4 border-t-indigo-500">
              <div className="px-4 py-2 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-100 rounded-lg shadow-sm">
                    <MapPin className="h-4 w-4 text-indigo-700" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Ubicación</h2>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inputs Dirección */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="direccion" className="text-xs font-medium text-gray-700">Dirección Completa</Label>
                      <Input
                        id="direccion"
                        value={configuracion.direccion}
                        onChange={(e) => setConfiguracion({ ...configuracion, direccion: e.target.value })}
                        className="h-8 bg-white border-gray-200 hover:border-indigo-300 focus:bg-indigo-50/20 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm rounded-md text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="ciudad" className="text-xs font-medium text-gray-700">Ciudad</Label>
                        <Input
                          id="ciudad"
                          value={configuracion.ciudad}
                          onChange={(e) => setConfiguracion({ ...configuracion, ciudad: e.target.value })}
                          className="h-8 bg-white border-gray-200 hover:border-indigo-300 focus:bg-indigo-50/20 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm rounded-md text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="codigoPostal" className="text-xs font-medium text-gray-700">C. Postal</Label>
                        <Input
                          id="codigoPostal"
                          value={configuracion.codigoPostal}
                          onChange={(e) => setConfiguracion({ ...configuracion, codigoPostal: e.target.value })}
                          className="h-8 bg-white border-gray-200 hover:border-indigo-300 focus:bg-indigo-50/20 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm rounded-md text-xs"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label htmlFor="pais" className="text-xs font-medium text-gray-700">País</Label>
                        <SelectorPais
                          value={configuracion.pais}
                          onChange={(valor) => {
                            const datosRegionales = DATOS_REGIONALES[valor]
                            setConfiguracion({ 
                              ...configuracion, 
                              pais: valor,
                              moneda: datosRegionales?.moneda || configuracion.moneda,
                              idioma: datosRegionales?.idioma || configuracion.idioma,
                              zonaHoraria: datosRegionales?.zonaHoraria || configuracion.zonaHoraria
                            })
                          }}
                          paises={PAISES}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mapa Preview */}
                  <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 h-48 md:h-full min-h-[200px] relative group shadow-inner">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      marginHeight="0" 
                      marginWidth="0" 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(`${configuracion.direccion || ''}, ${configuracion.ciudad || ''}, ${configuracion.pais || ''}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="absolute inset-0 w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                      allowFullScreen
                    ></iframe>
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium text-gray-600 shadow-sm pointer-events-none">
                      Vista Previa
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Columna Derecha: Configuración del Sistema (Unificada) */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 border-t-4 border-t-slate-600 h-fit">
              <div className="px-4 py-2 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-100 rounded-lg shadow-sm">
                    <Settings className="h-4 w-4 text-slate-700" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Configuración del Sistema</h2>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
              {/* Preferencias Regionales */}
              <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="h-3 w-3" /> Preferencias Regionales
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="moneda" className="text-xs font-medium text-gray-700">Moneda</Label>
                      <Input
                        id="moneda"
                        value={configuracion.moneda}
                        onChange={(e) => setConfiguracion({ ...configuracion, moneda: e.target.value })}
                        className="h-8 bg-white border-gray-200 hover:border-slate-300 focus:bg-slate-50/20 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 transition-all shadow-sm rounded-md text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="idioma" className="text-xs font-medium text-gray-700">Idioma</Label>
                      <Input
                        id="idioma"
                        value={configuracion.idioma}
                        onChange={(e) => setConfiguracion({ ...configuracion, idioma: e.target.value })}
                        className="h-8 bg-white border-gray-200 hover:border-slate-300 focus:bg-slate-50/20 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 transition-all shadow-sm rounded-md text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="zonaHoraria" className="text-xs font-medium text-gray-700">Zona Horaria</Label>
                      <Input
                        id="zonaHoraria"
                        value={configuracion.zonaHoraria}
                        onChange={(e) => setConfiguracion({ ...configuracion, zonaHoraria: e.target.value })}
                        className="h-8 bg-white border-gray-200 hover:border-slate-300 focus:bg-slate-50/20 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 transition-all shadow-sm rounded-md text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Notificaciones */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Bell className="h-3 w-3" /> Notificaciones
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50/50 border border-gray-200 rounded-lg hover:border-amber-200 transition-colors">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">Email</span>
                      </div>
                      <Switch
                        id="notificacionesEmail"
                        checked={configuracion.notificacionesEmail}
                        onCheckedChange={(checked) => setConfiguracion({ ...configuracion, notificacionesEmail: checked })}
                        className="scale-75 origin-right"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50/50 border border-gray-200 rounded-lg hover:border-amber-200 transition-colors">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">SMS</span>
                      </div>
                      <Switch
                        id="notificacionesSMS"
                        checked={configuracion.notificacionesSMS}
                        onCheckedChange={(checked) => setConfiguracion({ ...configuracion, notificacionesSMS: checked })}
                        className="scale-75 origin-right"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Pasarela de Pagos (Stripe) */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="h-3 w-3" /> Pasarela de Pagos
                  </h3>
                  
                  <div className="flex items-center justify-between p-2 bg-purple-50/30 border border-purple-100 rounded-lg hover:border-purple-200 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                      <span className="text-xs font-medium text-purple-900">Stripe Habilitado</span>
                    </div>
                    <Switch
                      id="stripeActivo"
                      checked={configuracionStripe.activo}
                      onCheckedChange={(checked) => setConfiguracionStripe({ ...configuracionStripe, activo: checked })}
                      className="scale-75 origin-right data-[state=checked]:bg-purple-600"
                    />
                  </div>

                  {configuracionStripe.activo && (
                    <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1">
                        <Label htmlFor="publishableKey" className="text-[10px] font-medium text-gray-500">Clave Pública</Label>
                        <div className="relative group">
                          <Key className="absolute left-2 top-2 h-3 w-3 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                          <Input
                            id="publishableKey"
                            value={configuracionStripe.publishableKey}
                            onChange={(e) => setConfiguracionStripe({ ...configuracionStripe, publishableKey: e.target.value })}
                            className="pl-7 h-7 bg-white border-gray-200 hover:border-purple-300 focus:bg-purple-50/20 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all shadow-sm rounded-md font-mono text-[10px]"
                            placeholder="pk_test_..."
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="secretKey" className="text-[10px] font-medium text-gray-500">Clave Secreta</Label>
                        <div className="relative group">
                          <Key className="absolute left-2 top-2 h-3 w-3 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                          <Input
                            id="secretKey"
                            type="password"
                            value={configuracionStripe.secretKey}
                            onChange={(e) => setConfiguracionStripe({ ...configuracionStripe, secretKey: e.target.value })}
                            className="pl-7 h-7 bg-white border-gray-200 hover:border-purple-300 focus:bg-purple-50/20 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all shadow-sm rounded-md font-mono text-[10px]"
                            placeholder="sk_test_..."
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="webhookEndpoint" className="text-[10px] font-medium text-gray-500">Webhook Endpoint</Label>
                        <div className="relative group">
                          <Globe className="absolute left-2 top-2 h-3 w-3 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                          <Input
                            id="webhookEndpoint"
                            value={configuracionStripe.webhookEndpoint}
                            onChange={(e) => setConfiguracionStripe({ ...configuracionStripe, webhookEndpoint: e.target.value })}
                            className="pl-7 h-7 bg-white border-gray-200 hover:border-purple-300 focus:bg-purple-50/20 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all shadow-sm rounded-md font-mono text-[10px]"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  )
}


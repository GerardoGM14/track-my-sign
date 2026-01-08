"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { db, auth } from "../lib/firebase"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Plus, User, Users, Mail, Phone, Building, MapPin, Eye, FileText, Clock, Edit, Trash2, X, Lock, HelpCircle, Search, Globe, Map, KeyRound, FileText as FileTextIcon, LayoutGrid, List } from "lucide-react"
import { toast } from "../hooks/user-toast"
import { LoadingSpinner } from "../components/ui/loading-spinner"
import { Country, State, City } from "country-state-city"
import { DialogConfirmacionEliminar } from "../components/DialogConfirmacionEliminar"


export function PaginaClientes() {
  const { tiendaActual } = useContextoTienda()
  const [clientes, setClientes] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mostrarDialogoCliente, setMostrarDialogoCliente] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [clienteEditando, setClienteEditando] = useState(null)
  const [vista, setVista] = useState("cards") // "cards" o "lista"
  const [errorTelefono, setErrorTelefono] = useState("")
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false)
  const [clienteAEliminar, setClienteAEliminar] = useState(null)

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    direccion: "",
    estadoRegion: "", // Estado/Departamento/Región
    ciudad: "",
    codigoPostal: "",
    pais: "",
    estado: "activo",
    crearCuenta: false,
    password: "",
    confirmarPassword: "",
  })

  // Obtener todos los países
  const obtenerPaises = () => {
    return Country.getAllCountries()
  }

  // Obtener estados/departamentos de un país
  const obtenerEstados = (codigoPais) => {
    if (!codigoPais) return []
    return State.getStatesOfCountry(codigoPais)
  }

  // Obtener ciudades de un estado/departamento
  const obtenerCiudades = (codigoPais, codigoEstado) => {
    if (!codigoPais || !codigoEstado) return []
    return City.getCitiesOfState(codigoPais, codigoEstado)
  }

  // Validación de teléfono según el país
  const obtenerFormatoTelefono = (codigoPais) => {
    const formatos = {
      "PE": { min: 9, max: 9, ejemplo: "912345678", formato: "9 dígitos" }, // Perú
      "ES": { min: 9, max: 9, ejemplo: "612345678", formato: "9 dígitos" }, // España
      "MX": { min: 10, max: 10, ejemplo: "5512345678", formato: "10 dígitos" }, // México
      "CO": { min: 10, max: 10, ejemplo: "3123456789", formato: "10 dígitos" }, // Colombia
      "AR": { min: 10, max: 10, ejemplo: "1123456789", formato: "10 dígitos" }, // Argentina
      "CL": { min: 9, max: 9, ejemplo: "912345678", formato: "9 dígitos" }, // Chile
      "EC": { min: 9, max: 9, ejemplo: "912345678", formato: "9 dígitos" }, // Ecuador
      "US": { min: 10, max: 10, ejemplo: "1234567890", formato: "10 dígitos" }, // Estados Unidos
      "BR": { min: 10, max: 11, ejemplo: "11987654321", formato: "10-11 dígitos" }, // Brasil
      "PA": { min: 8, max: 8, ejemplo: "61234567", formato: "8 dígitos" }, // Panamá
      "CR": { min: 8, max: 8, ejemplo: "81234567", formato: "8 dígitos" }, // Costa Rica
      "GT": { min: 8, max: 8, ejemplo: "51234567", formato: "8 dígitos" }, // Guatemala
      "HN": { min: 8, max: 8, ejemplo: "91234567", formato: "8 dígitos" }, // Honduras
      "SV": { min: 8, max: 8, ejemplo: "71234567", formato: "8 dígitos" }, // El Salvador
      "NI": { min: 8, max: 8, ejemplo: "81234567", formato: "8 dígitos" }, // Nicaragua
      "DO": { min: 10, max: 10, ejemplo: "8091234567", formato: "10 dígitos" }, // República Dominicana
      "VE": { min: 10, max: 10, ejemplo: "4121234567", formato: "10 dígitos" }, // Venezuela
      "BO": { min: 8, max: 8, ejemplo: "71234567", formato: "8 dígitos" }, // Bolivia
      "PY": { min: 9, max: 9, ejemplo: "981234567", formato: "9 dígitos" }, // Paraguay
      "UY": { min: 8, max: 8, ejemplo: "91234567", formato: "8 dígitos" }, // Uruguay
    }
    return formatos[codigoPais] || { min: 8, max: 15, ejemplo: "", formato: "8-15 dígitos" }
  }

  const validarTelefono = (telefono, codigoPais) => {
    if (!telefono) return { valido: true, mensaje: "" }
    if (!codigoPais) return { valido: true, mensaje: "Seleccione un país para validar el teléfono" }
    
    const formato = obtenerFormatoTelefono(codigoPais)
    const soloNumeros = telefono.replace(/\D/g, "")
    
    if (soloNumeros.length < formato.min) {
      return { 
        valido: false, 
        mensaje: `El teléfono debe tener al menos ${formato.min} dígitos` 
      }
    }
    if (soloNumeros.length > formato.max) {
      return { 
        valido: false, 
        mensaje: `El teléfono no puede tener más de ${formato.max} dígitos` 
      }
    }
    return { valido: true, mensaje: "" }
  }

  // Resetear estado y ciudad cuando cambia el país
  const manejarCambioPais = (codigoPais) => {
    setNuevoCliente({
      ...nuevoCliente,
      pais: codigoPais,
      estadoRegion: "", // Resetear estado cuando cambia el país
      ciudad: "", // Resetear ciudad cuando cambia el país
    })
    // Validar teléfono si existe cuando cambia el país
    if (nuevoCliente.telefono && codigoPais) {
      const validacion = validarTelefono(nuevoCliente.telefono, codigoPais)
      setErrorTelefono(validacion.mensaje)
    } else {
      setErrorTelefono("")
    }
  }

  // Resetear ciudad cuando cambia el estado/departamento
  const manejarCambioEstado = (codigoEstado) => {
    setNuevoCliente({
      ...nuevoCliente,
      estadoRegion: codigoEstado,
      ciudad: "", // Resetear ciudad cuando cambia el estado
    })
  }

  useEffect(() => {
    if (tiendaActual) {
      cargarDatos()
    }
  }, [tiendaActual])

  const cargarDatos = async () => {
    try {
      setCargando(true)

      // Cargar clientes
      const clientesRef = collection(db, "tiendas", tiendaActual.id, "clientes")
      const clientesSnapshot = await getDocs(clientesRef)
      const clientesData = clientesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setClientes(clientesData)

      // Cargar órdenes
      const ordenesRef = collection(db, "tiendas", tiendaActual.id, "ordenes")
      const ordenesSnapshot = await getDocs(ordenesRef)
      const ordenesData = ordenesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setOrdenes(ordenesData)

      // Cargar cotizaciones
      const cotizacionesRef = collection(db, "tiendas", tiendaActual.id, "cotizaciones")
      const cotizacionesSnapshot = await getDocs(cotizacionesRef)
      const cotizacionesData = cotizacionesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setCotizaciones(cotizacionesData)
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setCargando(false)
    }
  }

  const guardarCliente = async () => {
    try {
      setCargando(true)

      // Validar contraseñas si se está creando cuenta
      if (nuevoCliente.crearCuenta && !clienteEditando) {
        if (!nuevoCliente.password || nuevoCliente.password.length < 6) {
          toast({
            title: "Error",
            description: "La contraseña debe tener al menos 6 caracteres",
            variant: "destructive",
          })
          setCargando(false)
          return
        }
        if (nuevoCliente.password !== nuevoCliente.confirmarPassword) {
          toast({
            title: "Error",
            description: "Las contraseñas no coinciden",
            variant: "destructive",
          })
          setCargando(false)
          return
        }
      }

      // Crear usuario en Firebase Auth si se está creando cuenta
      let userId = null
      if (nuevoCliente.crearCuenta && !clienteEditando) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, nuevoCliente.email, nuevoCliente.password)
          userId = userCredential.user.uid

          // Crear documento de usuario en Firestore
          await setDoc(doc(db, "usuarios", userId), {
            id: userId,
            email: nuevoCliente.email,
            nombre: nuevoCliente.nombre,
            rol: "customer",
            tiendaId: tiendaActual.id,
            telefono: nuevoCliente.telefono || "",
            empresa: nuevoCliente.empresa || "",
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
            activo: true,
          })
        } catch (error) {
          console.error("Error creando usuario:", error)
          toast({
            title: "Error",
            description: error.message || "No se pudo crear la cuenta del usuario",
            variant: "destructive",
          })
          setCargando(false)
          return
        }
      }

      const clientesRef = collection(db, "tiendas", tiendaActual.id, "clientes")

      const datosCliente = {
        nombre: nuevoCliente.nombre,
        email: nuevoCliente.email,
        telefono: nuevoCliente.telefono,
        empresa: nuevoCliente.empresa,
        direccion: nuevoCliente.direccion,
        estadoRegion: nuevoCliente.estadoRegion,
        ciudad: nuevoCliente.ciudad,
        codigoPostal: nuevoCliente.codigoPostal,
        pais: nuevoCliente.pais,
        estado: nuevoCliente.estado || "activo",
        userId: userId || clienteEditando?.userId || null,
        fechaCreacion: clienteEditando ? clienteEditando.fechaCreacion : new Date(),
        fechaActualizacion: new Date(),
      }

      if (clienteEditando) {
        await updateDoc(doc(db, "tiendas", tiendaActual.id, "clientes", clienteEditando.id), datosCliente)
        toast({
          title: "Cliente actualizado",
          description: "Los datos del cliente se han actualizado correctamente",
        })
      } else {
        await addDoc(clientesRef, datosCliente)
        toast({
          title: "Cliente creado",
          description: nuevoCliente.crearCuenta 
            ? "El cliente y su cuenta se han creado exitosamente" 
            : "El cliente se ha creado exitosamente",
        })
      }

      await cargarDatos()
      setMostrarDialogoCliente(false)
      setClienteEditando(null)
      resetearFormulario()
    } catch (error) {
      console.error("Error guardando cliente:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el cliente. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const resetearFormulario = () => {
    setNuevoCliente({
      nombre: "",
      email: "",
      telefono: "",
      empresa: "",
      direccion: "",
      estadoRegion: "",
      ciudad: "",
      codigoPostal: "",
      pais: "",
      estado: "activo",
      crearCuenta: false,
      password: "",
      confirmarPassword: "",
    })
    setErrorTelefono("")
  }

  const editarCliente = (cliente) => {
    setClienteEditando(cliente)
    setNuevoCliente({
      nombre: cliente.nombre || "",
      email: cliente.email || "",
      telefono: cliente.telefono || "",
      empresa: cliente.empresa || "",
      direccion: cliente.direccion || "",
      estadoRegion: cliente.estadoRegion || "",
      ciudad: cliente.ciudad || "",
      codigoPostal: cliente.codigoPostal || "",
      pais: cliente.pais || "",
      notas: cliente.notas || "",
      estado: cliente.estado || "activo",
      crearCuenta: false,
      password: "",
      confirmarPassword: "",
    })
    setMostrarDialogoCliente(true)
  }

  // Función para obtener el badge según el estado
  const obtenerBadgeEstado = (estado) => {
    const badges = {
      activo: {
        className: "bg-green-100 text-green-800 border-green-200",
        icon: "●",
        text: "Activo"
      },
      inactivo: {
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: "●",
        text: "Inactivo"
      },
      pendiente: {
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: "●",
        text: "Pendiente"
      },
      bloqueado: {
        className: "bg-red-100 text-red-800 border-red-200",
        icon: "●",
        text: "Bloqueado"
      },
      verificado: {
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: "+",
        text: "Verificado"
      },
    }
    return badges[estado] || badges.activo
  }

  const eliminarCliente = async (id) => {
    setClienteAEliminar(id)
    setMostrarConfirmacionEliminar(true)
  }

  const confirmarEliminacion = async () => {
    if (!clienteAEliminar) return

    try {
      setCargando(true)
      await deleteDoc(doc(db, "tiendas", tiendaActual.id, "clientes", clienteAEliminar))
      await cargarDatos()
      toast({
        title: "Cliente eliminado",
        description: "El cliente se ha eliminado correctamente",
      })
      setMostrarConfirmacionEliminar(false)
      setClienteAEliminar(null)
    } catch (error) {
      console.error("Error eliminando cliente:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const obtenerOrdenesCliente = (clienteEmail) => {
    return ordenes.filter((orden) => orden.cliente?.email === clienteEmail)
  }

  const obtenerCotizacionesCliente = (clienteEmail) => {
    return cotizaciones.filter((cotizacion) => cotizacion.cliente?.email === clienteEmail)
  }

  const calcularTotalGastado = (clienteEmail) => {
    const ordenesCliente = obtenerOrdenesCliente(clienteEmail)
    return ordenesCliente
      .filter((orden) => orden.estado === "completado")
      .reduce((total, orden) => total + Number.parseFloat(orden.totales?.total || 0), 0)
  }

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case "borrador":
        return "bg-gray-100 text-gray-800"
      case "enviada":
        return "bg-blue-100 text-blue-800"
      case "aprobada":
        return "bg-green-100 text-green-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "en_progreso":
        return "bg-blue-100 text-blue-800"
      case "completado":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 min-h-full px-18">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Gestión de Clientes</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-tight">Administra tu base de datos de clientes</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setVista("cards")}
              className={`p-2 transition-colors ${
                vista === "cards" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVista("lista")}
              className={`p-2 transition-colors border-l border-gray-300 ${
                vista === "lista" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button 
            onClick={() => setMostrarDialogoCliente(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Lista de clientes */}
      {vista === "cards" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {clientes.map((cliente) => {
            const ordenesCliente = obtenerOrdenesCliente(cliente.email)
            const cotizacionesCliente = obtenerCotizacionesCliente(cliente.email)
            const totalGastado = calcularTotalGastado(cliente.email)

            return (
              <Card 
                key={cliente.id} 
                className="border border-gray-200 rounded-xl shadow-md bg-white hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3 pt-4 px-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                          {cliente.nombre}
                        </CardTitle>
                        {cliente.estado && (() => {
                          const badge = obtenerBadgeEstado(cliente.estado)
                          return (
                            <Badge className={`${badge.className} border rounded-full px-2.5 py-1 text-xs font-medium flex items-center gap-1 flex-shrink-0`}>
                              <span className="text-[10px]">{badge.icon}</span>
                              {badge.text}
                            </Badge>
                          )
                        })()}
                      </div>
                      {cliente.empresa && (
                        <p className="text-sm text-gray-600 leading-tight truncate">{cliente.empresa}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-5 pb-4">
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 flex-shrink-0 text-blue-600" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                    {cliente.telefono && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0 text-blue-600" />
                        <span>{cliente.telefono}</span>
                      </div>
                    )}
                    {cliente.direccion && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-blue-600" />
                        <span className="truncate">
                          {cliente.direccion}
                          {cliente.ciudad && `, ${cliente.ciudad}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600 leading-tight">{cotizacionesCliente.length}</p>
                        <p className="text-xs text-gray-500 leading-tight">Cotizaciones</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600 leading-tight">{ordenesCliente.length}</p>
                        <p className="text-xs text-gray-500 leading-tight">Órdenes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 leading-tight">€{totalGastado.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 leading-tight">Total</p>
                      </div>
                    </div>
                    <div className="flex justify-center gap-1.5">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => editarCliente(cliente)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8 w-8 p-0"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setClienteSeleccionado(cliente)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8 w-8 p-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => eliminarCliente(cliente.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {clientes.map((cliente) => {
            const ordenesCliente = obtenerOrdenesCliente(cliente.email)
            const cotizacionesCliente = obtenerCotizacionesCliente(cliente.email)
            const totalGastado = calcularTotalGastado(cliente.email)

            return (
              <Card 
                key={cliente.id} 
                className="border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{cliente.nombre}</h3>
                          {cliente.estado && (() => {
                            const badge = obtenerBadgeEstado(cliente.estado)
                            return (
                              <Badge className={`${badge.className} border rounded-full px-2.5 py-1 text-xs font-medium flex items-center gap-1 flex-shrink-0`}>
                                <span className="text-[10px]">{badge.icon}</span>
                                {badge.text}
                              </Badge>
                            )
                          })()}
                        </div>
                        {cliente.empresa && (
                          <p className="text-sm text-gray-600 mb-2 truncate">{cliente.empresa}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span className="truncate">{cliente.email}</span>
                          </div>
                          {cliente.telefono && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <span>{cliente.telefono}</span>
                            </div>
                          )}
                          {cliente.direccion && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <span className="truncate">
                                {cliente.direccion}
                                {cliente.ciudad && `, ${cliente.ciudad}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="flex items-center gap-4 text-center">
                        <div>
                          <p className="text-base font-bold text-blue-600">{cotizacionesCliente.length}</p>
                          <p className="text-xs text-gray-500">Cotizaciones</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-green-600">{ordenesCliente.length}</p>
                          <p className="text-xs text-gray-500">Órdenes</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">€{totalGastado.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Total</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => editarCliente(cliente)}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8 w-8 p-0"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setClienteSeleccionado(cliente)}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8 w-8 p-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => eliminarCliente(cliente.id)}
                          className="border-red-300 text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de detalles del cliente */}
      {clienteSeleccionado && (
        <Dialog open={!!clienteSeleccionado} onOpenChange={() => setClienteSeleccionado(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                {clienteSeleccionado.nombre}
                {clienteSeleccionado.empresa && (
                  <span className="text-sm text-gray-500">- {clienteSeleccionado.empresa}</span>
                )}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="cotizaciones">Cotizaciones</TabsTrigger>
                <TabsTrigger value="ordenes">Órdenes</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{clienteSeleccionado.email}</span>
                      </div>
                      {clienteSeleccionado.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{clienteSeleccionado.telefono}</span>
                        </div>
                      )}
                      {clienteSeleccionado.empresa && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <span>{clienteSeleccionado.empresa}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dirección</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {clienteSeleccionado.direccion ? (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                          <div>
                            <p>{clienteSeleccionado.direccion}</p>
                            {clienteSeleccionado.ciudad && (
                              <p>
                                {clienteSeleccionado.ciudad}
                                {clienteSeleccionado.codigoPostal && `, ${clienteSeleccionado.codigoPostal}`}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No hay dirección registrada</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {clienteSeleccionado.notas && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{clienteSeleccionado.notas}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="cotizaciones">
                <div className="space-y-3">
                  {obtenerCotizacionesCliente(clienteSeleccionado.email).map((cotizacion) => (
                    <Card key={cotizacion.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4" />
                              <span className="font-semibold">{cotizacion.numero}</span>
                              <Badge className={obtenerColorEstado(cotizacion.estado)}>{cotizacion.estado}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {cotizacion.items?.length || 0} items - €{cotizacion.totales?.total || "0.00"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(cotizacion.fechaCreacion?.seconds * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {obtenerCotizacionesCliente(clienteSeleccionado.email).length === 0 && (
                    <p className="text-center text-gray-500 py-8">No hay cotizaciones para este cliente</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ordenes">
                <div className="space-y-3">
                  {obtenerOrdenesCliente(clienteSeleccionado.email).map((orden) => (
                    <Card key={orden.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-semibold">{orden.numero}</span>
                              <Badge className={obtenerColorEstado(orden.estado)}>{orden.estado}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              €{orden.totales?.total || "0.00"} - Entrega:{" "}
                              {new Date(orden.fechaEntrega?.seconds * 1000).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Creada: {new Date(orden.fechaCreacion?.seconds * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {obtenerOrdenesCliente(clienteSeleccionado.email).length === 0 && (
                    <p className="text-center text-gray-500 py-8">No hay órdenes para este cliente</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {clientes.length === 0 && !cargando && (
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-base mb-2">No hay clientes registrados</p>
            <p className="text-gray-400 text-sm mb-6">Comienza agregando tu primer cliente</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setMostrarDialogoCliente(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primer Cliente
            </Button>
          </CardContent>
        </Card>
      )}

      {cargando && clientes.length === 0 && (
        <LoadingSpinner texto="Cargando clientes..." />
      )}

      {/* Overlay oscuro cuando el sidebar está abierto */}
      {mostrarDialogoCliente && (
        <div 
          className="fixed inset-0 bg-gray-600/40 z-[100] transition-opacity duration-300"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0
          }}
          onClick={() => {
            setMostrarDialogoCliente(false)
            setClienteEditando(null)
            resetearFormulario()
          }}
        />
      )}

      {/* Sidebar que se desliza desde la derecha */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${
          mostrarDialogoCliente ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto bg-white">
          {/* Header del sidebar */}
          <div className="px-6 py-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-200 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 mb-0.5 flex items-center gap-2">
                    {clienteEditando ? "Editar Cliente" : "Nuevo Cliente"}
                    <button className="p-0.5 hover:bg-blue-100 rounded transition-colors">
                      <HelpCircle className="h-4 w-4 text-blue-500" />
                    </button>
                  </h2>
                  <p className="text-sm text-gray-600 leading-tight">
                    {clienteEditando ? "Modifica la información del cliente" : "Seleccione los parámetros de registro."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMostrarDialogoCliente(false)
                  setClienteEditando(null)
                  resetearFormulario()
                }}
                className="p-1.5 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4 text-gray-500 hover:text-blue-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Contenido del formulario */}
          <div className="flex-1 px-6 py-5 bg-gradient-to-b from-white to-blue-50/30">
            {/* Campos del formulario en dos columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre" className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  Nombre Completo
                </Label>
                <Input
                  id="nombre"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                  className="w-full h-10 text-base border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={nuevoCliente.email}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
                  className="w-full h-10 text-base border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefono" className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-blue-600" />
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={nuevoCliente.telefono}
                  onChange={(e) => {
                    const valor = e.target.value
                    setNuevoCliente({ ...nuevoCliente, telefono: valor })
                    if (nuevoCliente.pais) {
                      const validacion = validarTelefono(valor, nuevoCliente.pais)
                      setErrorTelefono(validacion.mensaje)
                    }
                  }}
                  onBlur={() => {
                    if (nuevoCliente.telefono && nuevoCliente.pais) {
                      const validacion = validarTelefono(nuevoCliente.telefono, nuevoCliente.pais)
                      setErrorTelefono(validacion.mensaje)
                    }
                  }}
                  className={`w-full h-10 text-base border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors ${
                    errorTelefono && nuevoCliente.telefono && nuevoCliente.pais && !validarTelefono(nuevoCliente.telefono, nuevoCliente.pais).valido 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                      : ""
                  }`}
                  placeholder={nuevoCliente.pais ? `Ej: ${obtenerFormatoTelefono(nuevoCliente.pais).ejemplo || ""}` : "Ingrese el teléfono"}
                />
                {nuevoCliente.pais && (
                  <p className={`text-xs mt-1 ${
                    errorTelefono && nuevoCliente.telefono && !validarTelefono(nuevoCliente.telefono, nuevoCliente.pais).valido
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}>
                    {errorTelefono && nuevoCliente.telefono && !validarTelefono(nuevoCliente.telefono, nuevoCliente.pais).valido
                      ? errorTelefono
                      : `Formato: ${obtenerFormatoTelefono(nuevoCliente.pais).formato}`}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="empresa" className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-blue-600" />
                  Empresa
                </Label>
                <Input
                  id="empresa"
                  value={nuevoCliente.empresa}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, empresa: e.target.value })}
                  className="w-full h-10 text-base border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="direccion" className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  value={nuevoCliente.direccion}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                  className="w-full h-10 text-base border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>
              <div>
                <Label htmlFor="pais" className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-blue-600" />
                  País
                </Label>
                <select
                  id="pais"
                  value={nuevoCliente.pais}
                  onChange={(e) => manejarCambioPais(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-md bg-white text-gray-900 text-base hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                >
                  <option value="">Seleccione...</option>
                  {obtenerPaises().map((pais) => (
                    <option key={pais.isoCode} value={pais.isoCode}>
                      {pais.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="estadoRegion" className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Map className="h-3.5 w-3.5 text-blue-600" />
                  Estado/Departamento
                </Label>
                <select
                  id="estadoRegion"
                  value={nuevoCliente.estadoRegion}
                  onChange={(e) => manejarCambioEstado(e.target.value)}
                  disabled={!nuevoCliente.pais}
                  className="w-full h-10 px-3 border border-gray-200 rounded-md bg-white text-gray-900 text-base hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="">{nuevoCliente.pais ? "Seleccione..." : "Primero seleccione un país"}</option>
                  {obtenerEstados(nuevoCliente.pais).map((estado) => (
                    <option key={estado.isoCode} value={estado.isoCode}>
                      {estado.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="ciudad" className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  Ciudad
                </Label>
                <select
                  id="ciudad"
                  value={nuevoCliente.ciudad}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, ciudad: e.target.value })}
                  disabled={!nuevoCliente.pais || !nuevoCliente.estadoRegion}
                  className="w-full h-10 px-3 border border-gray-200 rounded-md bg-white text-gray-900 text-base hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="">{nuevoCliente.estadoRegion ? "Seleccione..." : nuevoCliente.pais ? "Primero seleccione un estado/departamento" : "Primero seleccione un país"}</option>
                  {obtenerCiudades(nuevoCliente.pais, nuevoCliente.estadoRegion).map((ciudad) => (
                    <option key={ciudad.name} value={ciudad.name}>
                      {ciudad.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="codigoPostal" className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  Código Postal
                </Label>
                <Input
                  id="codigoPostal"
                  value={nuevoCliente.codigoPostal}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, codigoPostal: e.target.value })}
                  className="w-full h-10 text-base border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="estado" className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <FileTextIcon className="h-3.5 w-3.5 text-blue-600" />
                  Estado
                </Label>
                <select
                  id="estado"
                  value={nuevoCliente.estado}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, estado: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-200 rounded-md bg-white text-gray-900 text-base hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="bloqueado">Bloqueado</option>
                  <option value="verificado">Verificado</option>
                </select>
              </div>
            </div>

            {/* Sección: Crear Cuenta de Usuario */}
            {!clienteEditando && (
              <div className="mt-6 pt-6 border-t border-blue-100">
                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <input
                    type="checkbox"
                    id="crearCuenta"
                    checked={nuevoCliente.crearCuenta}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, crearCuenta: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <Label htmlFor="crearCuenta" className="text-sm font-medium text-gray-900 flex items-center gap-2 cursor-pointer">
                    <Lock className="h-4 w-4 text-blue-600" />
                    Crear cuenta de usuario para el cliente
                  </Label>
                </div>
                
                {nuevoCliente.crearCuenta && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                        Contraseña
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={nuevoCliente.password}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, password: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full h-10 text-base border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        required={nuevoCliente.crearCuenta}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmarPassword" className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                        Confirmar Contraseña
                      </Label>
                      <Input
                        id="confirmarPassword"
                        type="password"
                        value={nuevoCliente.confirmarPassword}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, confirmarPassword: e.target.value })}
                        placeholder="Repite la contraseña"
                        className="w-full h-10 text-base border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        required={nuevoCliente.crearCuenta}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer fijo con botones */}
          <div className="border-t border-blue-100 bg-gradient-to-r from-white to-blue-50/50 px-6 py-4 sticky bottom-0 shadow-lg shadow-blue-100/50">
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setMostrarDialogoCliente(false)
                  setClienteEditando(null)
                  resetearFormulario()
                }}
                className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 bg-white px-4 py-2 text-sm font-medium h-9 transition-all"
              >
                Cancelar
              </Button>
              <Button 
                onClick={guardarCliente} 
                disabled={cargando || !nuevoCliente.nombre || !nuevoCliente.email}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 text-sm font-medium flex items-center gap-2 h-9 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="h-3.5 w-3.5" />
                {cargando ? "Guardando..." : clienteEditando ? "Actualizar Cliente" : "Crear Cliente"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <DialogConfirmacionEliminar
        open={mostrarConfirmacionEliminar}
        onOpenChange={setMostrarConfirmacionEliminar}
        onConfirmar={confirmarEliminacion}
        titulo="¿Está seguro de eliminar este cliente?"
        mensaje="Esta acción no se puede deshacer y afectará a todos los datos vinculados."
        cargando={cargando}
      />
    </div>
  )
}

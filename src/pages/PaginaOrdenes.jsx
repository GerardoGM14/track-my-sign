"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { useContextoAuth } from "../contexts/ContextoAuth"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Clock, User, Calendar, FileText, Plus, ArrowRight, CheckCircle, AlertCircle, PlayCircle } from "lucide-react"

export function PaginaOrdenes() {
  const { tiendaActual } = useContextoTienda()
  const { usuarioActual } = useContextoAuth()
  const [ordenes, setOrdenes] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mostrarDialogoOrden, setMostrarDialogoOrden] = useState(false)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)

  const [nuevaOrden, setNuevaOrden] = useState({
    cotizacionId: "",
    prioridad: "media",
    fechaEntrega: "",
    empleadoAsignado: "",
    notas: "",
  })

  const estados = [
    {
      id: "pendiente",
      nombre: "Pendiente",
      color: "bg-gray-100 text-gray-800",
      icono: Clock,
    },
    {
      id: "en_progreso",
      nombre: "En Progreso",
      color: "bg-blue-100 text-blue-800",
      icono: PlayCircle,
    },
    {
      id: "revision",
      nombre: "En Revisión",
      color: "bg-yellow-100 text-yellow-800",
      icono: AlertCircle,
    },
    {
      id: "completado",
      nombre: "Completado",
      color: "bg-green-100 text-green-800",
      icono: CheckCircle,
    },
  ]

  const prioridades = [
    { value: "baja", label: "Baja", color: "bg-green-100 text-green-800" },
    { value: "media", label: "Media", color: "bg-yellow-100 text-yellow-800" },
    { value: "alta", label: "Alta", color: "bg-red-100 text-red-800" },
  ]

  useEffect(() => {
    if (tiendaActual) {
      cargarDatos()
    }
  }, [tiendaActual])

  const cargarDatos = async () => {
    try {
      setCargando(true)

      // Cargar órdenes
      const ordenesRef = collection(db, "tiendas", tiendaActual.id, "ordenes")
      const ordenesSnapshot = await getDocs(ordenesRef)
      const ordenesData = ordenesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setOrdenes(ordenesData)

      // Cargar empleados
      const usuariosRef = collection(db, "usuarios")
      const empleadosQuery = query(usuariosRef, where("tiendaId", "==", tiendaActual.id))
      const empleadosSnapshot = await getDocs(empleadosQuery)
      const empleadosData = empleadosSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.rol === "empleado" || user.rol === "admin")
      setEmpleados(empleadosData)

      // Cargar cotizaciones aprobadas
      const cotizacionesRef = collection(db, "tiendas", tiendaActual.id, "cotizaciones")
      const cotizacionesQuery = query(cotizacionesRef, where("estado", "==", "aprobada"))
      const cotizacionesSnapshot = await getDocs(cotizacionesQuery)
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

  const generarNumeroOrden = () => {
    const fecha = new Date()
    const año = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, "0")
    const contador = ordenes.length + 1
    return `ORD-${año}${mes}-${String(contador).padStart(3, "0")}`
  }

  const crearOrdenDesdeCotizacion = async () => {
    if (!nuevaOrden.cotizacionId) return

    try {
      setCargando(true)
      const cotizacion = cotizaciones.find((c) => c.id === nuevaOrden.cotizacionId)

      const ordenData = {
        numero: generarNumeroOrden(),
        cotizacionId: nuevaOrden.cotizacionId,
        cliente: cotizacion.cliente,
        items: cotizacion.items,
        totales: cotizacion.totales,
        estado: "pendiente",
        prioridad: nuevaOrden.prioridad,
        fechaCreacion: new Date(),
        fechaEntrega: new Date(nuevaOrden.fechaEntrega),
        empleadoAsignado: nuevaOrden.empleadoAsignado,
        notas: nuevaOrden.notas,
        tiempoIniciado: null,
        tiempoCompletado: null,
        historialEstados: [
          {
            estado: "pendiente",
            fecha: new Date(),
            usuario: usuarioActual.nombre,
          },
        ],
      }

      const ordenesRef = collection(db, "tiendas", tiendaActual.id, "ordenes")
      await addDoc(ordenesRef, ordenData)

      // Actualizar estado de cotización
      await updateDoc(doc(db, "tiendas", tiendaActual.id, "cotizaciones", nuevaOrden.cotizacionId), {
        estado: "convertida_orden",
      })

      await cargarDatos()
      setMostrarDialogoOrden(false)
      setNuevaOrden({
        cotizacionId: "",
        prioridad: "media",
        fechaEntrega: "",
        empleadoAsignado: "",
        notas: "",
      })
    } catch (error) {
      console.error("Error creando orden:", error)
    } finally {
      setCargando(false)
    }
  }

  const cambiarEstadoOrden = async (ordenId, nuevoEstado) => {
    try {
      const orden = ordenes.find((o) => o.id === ordenId)
      const actualizacion = {
        estado: nuevoEstado,
        fechaActualizacion: new Date(),
        historialEstados: [
          ...orden.historialEstados,
          {
            estado: nuevoEstado,
            fecha: new Date(),
            usuario: usuarioActual.nombre,
          },
        ],
      }

      // Agregar timestamps específicos
      if (nuevoEstado === "en_progreso" && !orden.tiempoIniciado) {
        actualizacion.tiempoIniciado = new Date()
      }
      if (nuevoEstado === "completado") {
        actualizacion.tiempoCompletado = new Date()
      }

      await updateDoc(doc(db, "tiendas", tiendaActual.id, "ordenes", ordenId), actualizacion)
      await cargarDatos()
    } catch (error) {
      console.error("Error actualizando estado:", error)
    }
  }

  const asignarEmpleado = async (ordenId, empleadoId) => {
    try {
      await updateDoc(doc(db, "tiendas", tiendaActual.id, "ordenes", ordenId), {
        empleadoAsignado: empleadoId,
        fechaActualizacion: new Date(),
      })
      await cargarDatos()
    } catch (error) {
      console.error("Error asignando empleado:", error)
    }
  }

  const obtenerOrdenesPorEstado = (estado) => {
    return ordenes.filter((orden) => orden.estado === estado)
  }

  const obtenerEmpleadoNombre = (empleadoId) => {
    const empleado = empleados.find((e) => e.id === empleadoId)
    return empleado ? empleado.nombre : "Sin asignar"
  }

  const calcularTiempoTranscurrido = (orden) => {
    if (!orden.tiempoIniciado) return null

    const inicio = new Date(orden.tiempoIniciado.seconds * 1000)
    const fin = orden.tiempoCompletado ? new Date(orden.tiempoCompletado.seconds * 1000) : new Date()
    const diferencia = fin - inicio
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    return `${dias}d ${horas}h`
  }

  const obtenerSiguienteEstado = (estadoActual) => {
    const indiceActual = estados.findIndex((e) => e.id === estadoActual)
    return indiceActual < estados.length - 1 ? estados[indiceActual + 1] : null
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Órdenes</h1>
        <Dialog open={mostrarDialogoOrden} onOpenChange={setMostrarDialogoOrden}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Orden
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Orden</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Cotización Aprobada</Label>
                <Select
                  value={nuevaOrden.cotizacionId}
                  onValueChange={(value) => setNuevaOrden({ ...nuevaOrden, cotizacionId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cotización" />
                  </SelectTrigger>
                  <SelectContent>
                    {cotizaciones.map((cotizacion) => (
                      <SelectItem key={cotizacion.id} value={cotizacion.id}>
                        {cotizacion.numero} - {cotizacion.cliente.nombre} (€{cotizacion.totales?.total})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prioridad</Label>
                <Select
                  value={nuevaOrden.prioridad}
                  onValueChange={(value) => setNuevaOrden({ ...nuevaOrden, prioridad: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridades.map((prioridad) => (
                      <SelectItem key={prioridad.value} value={prioridad.value}>
                        {prioridad.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fecha de Entrega</Label>
                <Input
                  type="date"
                  value={nuevaOrden.fechaEntrega}
                  onChange={(e) => setNuevaOrden({ ...nuevaOrden, fechaEntrega: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Empleado Asignado</Label>
                <Select
                  value={nuevaOrden.empleadoAsignado}
                  onValueChange={(value) => setNuevaOrden({ ...nuevaOrden, empleadoAsignado: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {empleados.map((empleado) => (
                      <SelectItem key={empleado.id} value={empleado.id}>
                        {empleado.nombre} ({empleado.rol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notas</Label>
                <Textarea
                  value={nuevaOrden.notas}
                  onChange={(e) => setNuevaOrden({ ...nuevaOrden, notas: e.target.value })}
                  placeholder="Notas adicionales para la orden"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={crearOrdenDesdeCotizacion}
                  disabled={cargando || !nuevaOrden.cotizacionId || !nuevaOrden.fechaEntrega}
                >
                  {cargando ? "Creando..." : "Crear Orden"}
                </Button>
                <Button variant="outline" onClick={() => setMostrarDialogoOrden(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tablero Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estados.map((estado) => {
          const ordenesEstado = obtenerOrdenesPorEstado(estado.id)
          const IconoEstado = estado.icono

          return (
            <div key={estado.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IconoEstado className="w-5 h-5" />
                  <h3 className="font-semibold">{estado.nombre}</h3>
                </div>
                <Badge variant="secondary">{ordenesEstado.length}</Badge>
              </div>

              <div className="space-y-3">
                {ordenesEstado.map((orden) => {
                  const siguienteEstado = obtenerSiguienteEstado(orden.estado)
                  const prioridad = prioridades.find((p) => p.value === orden.prioridad)

                  return (
                    <Card key={orden.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm">{orden.numero}</CardTitle>
                          <Badge className={prioridad.color}>{prioridad.label}</Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          {orden.cliente.nombre} - {orden.cliente.empresa}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            <span>{obtenerEmpleadoNombre(orden.empleadoAsignado)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>Entrega: {new Date(orden.fechaEntrega?.seconds * 1000).toLocaleDateString()}</span>
                          </div>

                          {orden.tiempoIniciado && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>Tiempo: {calcularTiempoTranscurrido(orden)}</span>
                            </div>
                          )}

                          <div className="text-sm font-semibold">€{orden.totales?.total || "0.00"}</div>

                          <div className="flex gap-1 mt-2">
                            {orden.empleadoAsignado !== usuarioActual.id && (
                              <Select
                                value={orden.empleadoAsignado || ""}
                                onValueChange={(value) => asignarEmpleado(orden.id, value)}
                              >
                                <SelectTrigger className="h-6 text-xs">
                                  <SelectValue placeholder="Asignar" />
                                </SelectTrigger>
                                <SelectContent>
                                  {empleados.map((empleado) => (
                                    <SelectItem key={empleado.id} value={empleado.id}>
                                      {empleado.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            {siguienteEstado && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs px-2 bg-transparent"
                                onClick={() => cambiarEstadoOrden(orden.id, siguienteEstado.id)}
                              >
                                <ArrowRight className="w-3 h-3 mr-1" />
                                {siguienteEstado.nombre}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {ordenesEstado.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No hay órdenes en {estado.nombre.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold">{ordenes.length}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-blue-600">{obtenerOrdenesPorEstado("en_progreso").length}</p>
              </div>
              <PlayCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{obtenerOrdenesPorEstado("completado").length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">
                  €{ordenes.reduce((sum, orden) => sum + Number.parseFloat(orden.totales?.total || 0), 0).toFixed(2)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {ordenes.length === 0 && !cargando && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay órdenes registradas</p>
          <Button className="mt-4" onClick={() => setMostrarDialogoOrden(true)}>
            Crear Primera Orden
          </Button>
        </div>
      )}
    </div>
  )
}

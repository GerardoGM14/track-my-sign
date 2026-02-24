"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useContextoTienda } from "@/contexts/ContextoTienda"
import { useContextoAuth } from "@/contexts/ContextoAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, User, Calendar, FileText, Plus, ArrowRight, CheckCircle, AlertCircle, PlayCircle, ClipboardList, X } from "lucide-react"
import { toast } from "@/hooks/user-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  DndContext,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Componente para la Tarjeta de Orden (Draggable)
function KanbanCard({ orden, prioridades, empleados, usuarioActual, asignarEmpleado, onClick, canDrag = true }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: orden.id, data: { orden }, disabled: !canDrag })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const prioridad = prioridades.find((p) => p.value === orden.prioridad) || { label: "Normal", color: "bg-gray-100" }
  const empleadoNombre = empleados.find((e) => e.id === orden.employeeAssigned)?.nombre || "Sin asignar"

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none mb-3">
      <Card 
        className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border border-gray-200 rounded-lg bg-white ${isDragging ? "shadow-xl rotate-2" : ""}`}
        onClick={onClick}
      >
        <CardHeader className="pb-2 p-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{orden.numero}</span>
            <Badge className={`${prioridad.color} text-[10px] px-1 py-0 h-5`}>{prioridad.label}</Badge>
          </div>
          <p className="text-xs text-gray-600 mt-2 font-medium truncate" title={orden.cliente?.nombre}>
            {orden.cliente?.nombre || "Sin cliente"}
          </p>
          {orden.cliente?.empresa && (
            <p className="text-[10px] text-gray-500 truncate">{orden.cliente.empresa}</p>
          )}
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[80px]" title={empleadoNombre}>{empleadoNombre}</span>
              </div>
              <span className="font-semibold text-gray-900">€{orden.totales?.total || "0.00"}</span>
            </div>
            
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{orden.fechaEntrega?.seconds ? new Date(orden.fechaEntrega.seconds * 1000).toLocaleDateString() : "Sin fecha"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para la Columna (Droppable)
function KanbanColumn({ id, title, icon: Icon, count, children }) {
  const { setNodeRef } = useSortable({ id: id, data: { type: "column" } })

  return (
    <div ref={setNodeRef} className="bg-gray-50/80 rounded-xl p-3 border border-gray-200 h-full min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${id === 'pendiente' ? 'bg-gray-200' : id === 'en_progreso' ? 'bg-blue-100' : id === 'revision' ? 'bg-yellow-100' : 'bg-green-100'}`}>
            <Icon className={`w-4 h-4 ${id === 'pendiente' ? 'text-gray-700' : id === 'en_progreso' ? 'text-blue-700' : id === 'revision' ? 'text-yellow-700' : 'text-green-700'}`} />
          </div>
          <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
        </div>
        <Badge variant="secondary" className="bg-white border border-gray-200 text-gray-600 text-xs font-mono">{count}</Badge>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {children}
      </div>
    </div>
  )
}

export function PaginaOrdenes() {
  const navigate = useNavigate()
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
    employeeAssigned: "",
    notas: "",
  })

  const [activeId, setActiveId] = useState(null)
  const [activeOrden, setActiveOrden] = useState(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Necesario para distinguir click de drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
    setActiveOrden(active.data.current?.orden)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    
    if (!over) {
      setActiveId(null)
      setActiveOrden(null)
      return
    }

    const ordenId = active.id
    const ordenActual = active.data.current?.orden
    
    // Identificar el contenedor destino (columna)
    let nuevoEstado = over.id

    // Si soltamos sobre otra tarjeta, buscamos su estado contenedor
    if (over.data.current?.orden) {
      nuevoEstado = over.data.current.orden.estado
    }

    // Validar que el estado destino sea válido
    const esEstadoValido = estados.some(e => e.id === nuevoEstado)
    
    if (esEstadoValido && ordenActual && ordenActual.estado !== nuevoEstado) {
      // Actualización optimista en UI
      setOrdenes(prev => prev.map(o => {
        if (o.id === ordenId) {
          return { ...o, estado: nuevoEstado }
        }
        return o
      }))

      // Actualización en Firebase
      await cambiarEstadoOrden(ordenId, nuevoEstado)
    }

    setActiveId(null)
    setActiveOrden(null)
  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

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
      let ordenesRef = collection(db, "tiendas", tiendaActual.id, "ordenes")
      let qOrdenes = query(ordenesRef)

      if (usuarioActual.rol === "customer") {
        // Asumiendo que cliente.id guarda el UID del usuario
        // Si no, habría que ver cómo se guarda el cliente en la orden
        // Por ahora intentamos filtrar por cliente.id
        qOrdenes = query(ordenesRef, where("cliente.id", "==", usuarioActual.uid))
      }

      const ordenesSnapshot = await getDocs(qOrdenes)
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
        .filter((user) => user.rol === "employee" || user.rol === "admin")
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
        employeeAssigned: nuevaOrden.employeeAssigned,
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
      resetearFormularioOrden()
      toast({
        title: "Orden creada",
        description: "La orden se ha creado exitosamente",
      })
    } catch (error) {
      console.error("Error creando orden:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la orden. Intenta nuevamente.",
        variant: "destructive",
      })
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
          ...(orden.historialEstados || []),
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
      toast({
        title: "Estado actualizado",
        description: `La orden se ha actualizado a ${nuevoEstado}`,
      })
    } catch (error) {
      console.error("Error actualizando estado:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const asignarEmpleado = async (ordenId, empleadoId) => {
    try {
      const empleado = empleados.find((e) => e.id === empleadoId)
      await updateDoc(doc(db, "tiendas", tiendaActual.id, "ordenes", ordenId), {
        employeeAssigned: empleadoId,
        fechaActualizacion: new Date(),
      })
      await cargarDatos()
      toast({
        title: "Empleado asignado",
        description: `La orden se ha asignado a ${empleado?.nombre || "el empleado"}`,
      })
    } catch (error) {
      console.error("Error asignando empleado:", error)
      toast({
        title: "Error",
        description: "No se pudo asignar el empleado. Intenta nuevamente.",
        variant: "destructive",
      })
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

  const resetearFormularioOrden = () => {
    setNuevaOrden({
      cotizacionId: "",
      prioridad: "media",
      fechaEntrega: "",
      empleadoAsignado: "",
      notas: "",
    })
  }

  return (
      <div className="space-y-6 min-h-full px-18">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Gestión de Órdenes</h1>
            <p className="text-sm text-gray-600 mt-1 leading-tight">Sigue el estado de tus órdenes de trabajo</p>
          </div>
          {usuarioActual.rol !== "customer" && (
            <Button 
              onClick={() => setMostrarDialogoOrden(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Orden
            </Button>
          )}
        </div>

      {cargando && ordenes.length === 0 && (
        <LoadingSpinner texto="Cargando órdenes..." />
      )}

      {!cargando && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Tablero Kanban */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
            {estados.map((estado) => {
              const ordenesEstado = obtenerOrdenesPorEstado(estado.id)
              
              return (
                <KanbanColumn
                  key={estado.id}
                  id={estado.id}
                  title={estado.nombre}
                  icon={estado.icono}
                  count={ordenesEstado.length}
                >
                  <SortableContext
                    items={ordenesEstado.map(o => o.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 min-h-[100px]">
                      {ordenesEstado.map((orden) => (
                        <KanbanCard
                          key={orden.id}
                          orden={orden}
                          prioridades={prioridades}
                          empleados={empleados}
                          usuarioActual={usuarioActual}
                          asignarEmpleado={asignarEmpleado}
                          canDrag={usuarioActual.rol !== "customer"}
                          onClick={() => {
                            // Evitar abrir el modal si estamos arrastrando
                            if (!activeId) {
                              navigate(`/${tiendaActual.slug}/ordenes/${orden.id}`)
                            }
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </KanbanColumn>
              )
            })}
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeOrden ? (
              <div className="transform rotate-2 opacity-80 cursor-grabbing">
                <Card className="border border-blue-500 shadow-2xl bg-white w-[280px]">
                  <CardHeader className="pb-2 p-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{activeOrden.numero}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 font-medium truncate">
                      {activeOrden.cliente?.nombre || "Sin cliente"}
                    </p>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-semibold text-gray-900">€{activeOrden.totales?.total || "0.00"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Overlay oscuro cuando el sidebar está abierto */}
      {mostrarDialogoOrden && (
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
            setMostrarDialogoOrden(false)
            resetearFormularioOrden()
          }}
        />
      )}

      {/* Sidebar que se desliza desde la derecha */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${
          mostrarDialogoOrden ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto bg-gray-50">
          {/* Header del sidebar */}
          <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Nueva Orden
                  </h2>
                  <p className="text-sm text-gray-500">
                    Crea una orden de trabajo desde una cotización aprobada
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMostrarDialogoOrden(false)
                  resetearFormularioOrden()
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Contenido del formulario */}
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                  Cotización Aprobada <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={nuevaOrden.cotizacionId}
                  onValueChange={(value) => setNuevaOrden({ ...nuevaOrden, cotizacionId: value })}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full">
                    <SelectValue placeholder="Seleccionar cotización" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-[102]">
                    {cotizaciones.map((cotizacion) => (
                      <SelectItem 
                        key={cotizacion.id} 
                        value={cotizacion.id}
                        className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm"
                      >
                        {cotizacion.numero} - {cotizacion.cliente.nombre} (€{cotizacion.totales?.total})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
                  Prioridad
                </Label>
                <Select
                  value={nuevaOrden.prioridad}
                  onValueChange={(value) => setNuevaOrden({ ...nuevaOrden, prioridad: value })}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-[102]">
                    {prioridades.map((prioridad) => (
                      <SelectItem 
                        key={prioridad.value} 
                        value={prioridad.value}
                        className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm"
                      >
                        {prioridad.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  Fecha de Entrega <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={nuevaOrden.fechaEntrega}
                  onChange={(e) => setNuevaOrden({ ...nuevaOrden, fechaEntrega: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  Empleado Asignado
                </Label>
                <Select
                  value={nuevaOrden.employeeAssigned}
                  onValueChange={(value) => setNuevaOrden({ ...nuevaOrden, employeeAssigned: value })}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full">
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-[102]">
                    {empleados.map((empleado) => (
                      <SelectItem 
                        key={empleado.id} 
                        value={empleado.id}
                        className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm"
                      >
                        {empleado.nombre} ({empleado.rol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                  Notas
                </Label>
                <Textarea
                  value={nuevaOrden.notas}
                  onChange={(e) => setNuevaOrden({ ...nuevaOrden, notas: e.target.value })}
                  placeholder="Notas adicionales para la orden"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px] resize-y"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="p-6 border-t border-gray-200 bg-white sticky bottom-0">
            <div className="flex gap-3">
              <Button
                onClick={crearOrdenDesdeCotizacion}
                disabled={cargando || !nuevaOrden.cotizacionId || !nuevaOrden.fechaEntrega}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                {cargando ? "Creando..." : "Crear Orden"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setMostrarDialogoOrden(false)
                  resetearFormularioOrden()
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


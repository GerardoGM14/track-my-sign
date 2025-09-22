"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoAuth } from "../contexts/ContextoAuth"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { FileText, CheckCircle, XCircle, Download, Eye, Clock, MessageSquare, Star, AlertTriangle } from "lucide-react"

export function PortalCliente() {
  const { usuarioActual } = useContextoAuth()
  const [cotizaciones, setCotizaciones] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [pruebas, setPruebas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [comentario, setComentario] = useState("")
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState(null)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null)

  useEffect(() => {
    if (usuarioActual) {
      cargarDatos()
    }
  }, [usuarioActual])

  const cargarDatos = async () => {
    try {
      setCargando(true)

      // Buscar en todas las tiendas las cotizaciones del cliente
      const tiendas = await getDocs(collection(db, "tiendas"))
      let todasCotizaciones = []
      let todasOrdenes = []
      let todasPruebas = []

      for (const tiendaDoc of tiendas.docs) {
        // Cotizaciones
        const cotizacionesRef = collection(db, "tiendas", tiendaDoc.id, "cotizaciones")
        const cotizacionesQuery = query(cotizacionesRef, where("cliente.email", "==", usuarioActual.email))
        const cotizacionesSnapshot = await getDocs(cotizacionesQuery)
        const cotizacionesData = cotizacionesSnapshot.docs.map((doc) => ({
          id: doc.id,
          tiendaId: tiendaDoc.id,
          tiendaNombre: tiendaDoc.data().nombre,
          ...doc.data(),
        }))
        todasCotizaciones = [...todasCotizaciones, ...cotizacionesData]

        // Órdenes
        const ordenesRef = collection(db, "tiendas", tiendaDoc.id, "ordenes")
        const ordenesQuery = query(ordenesRef, where("cliente.email", "==", usuarioActual.email))
        const ordenesSnapshot = await getDocs(ordenesQuery)
        const ordenesData = ordenesSnapshot.docs.map((doc) => ({
          id: doc.id,
          tiendaId: tiendaDoc.id,
          tiendaNombre: tiendaDoc.data().nombre,
          ...doc.data(),
        }))
        todasOrdenes = [...todasOrdenes, ...ordenesData]

        // Pruebas
        const pruebasRef = collection(db, "tiendas", tiendaDoc.id, "pruebas")
        const pruebasQuery = query(pruebasRef, where("clienteEmail", "==", usuarioActual.email))
        const pruebasSnapshot = await getDocs(pruebasQuery)
        const pruebasData = pruebasSnapshot.docs.map((doc) => ({
          id: doc.id,
          tiendaId: tiendaDoc.id,
          tiendaNombre: tiendaDoc.data().nombre,
          ...doc.data(),
        }))
        todasPruebas = [...todasPruebas, ...pruebasData]
      }

      setCotizaciones(todasCotizaciones)
      setOrdenes(todasOrdenes)
      setPruebas(todasPruebas)
    } catch (error) {
      console.error("Error cargando datos del cliente:", error)
    } finally {
      setCargando(false)
    }
  }

  const aprobarCotizacion = async (cotizacion) => {
    try {
      await updateDoc(doc(db, "tiendas", cotizacion.tiendaId, "cotizaciones", cotizacion.id), {
        estado: "aprobada",
        fechaAprobacion: new Date(),
        comentariosCliente: comentario,
      })
      await cargarDatos()
      setComentario("")
      setCotizacionSeleccionada(null)
    } catch (error) {
      console.error("Error aprobando cotización:", error)
    }
  }

  const rechazarCotizacion = async (cotizacion) => {
    try {
      await updateDoc(doc(db, "tiendas", cotizacion.tiendaId, "cotizaciones", cotizacion.id), {
        estado: "rechazada",
        fechaRechazo: new Date(),
        comentariosCliente: comentario,
      })
      await cargarDatos()
      setComentario("")
      setCotizacionSeleccionada(null)
    } catch (error) {
      console.error("Error rechazando cotización:", error)
    }
  }

  const obtenerProgresoOrden = (orden) => {
    const estados = ["pendiente", "en_progreso", "revision", "completado"]
    const indiceActual = estados.indexOf(orden.estado)
    return ((indiceActual + 1) / estados.length) * 100
  }

  const calcularDiasRestantes = (fechaEntrega) => {
    const hoy = new Date()
    const entrega = new Date(fechaEntrega.seconds * 1000)
    const diferencia = entrega - hoy
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))
    return dias
  }

  const aprobarPrueba = async (prueba) => {
    try {
      await updateDoc(doc(db, "tiendas", prueba.tiendaId, "pruebas", prueba.id), {
        estado: "aprobada",
        fechaAprobacion: new Date(),
        comentariosCliente: comentario,
      })

      // Actualizar estado de la orden si existe
      if (prueba.ordenId) {
        await updateDoc(doc(db, "tiendas", prueba.tiendaId, "ordenes", prueba.ordenId), {
          estado: "en_progreso",
          fechaActualizacion: new Date(),
        })
      }

      await cargarDatos()
      setComentario("")
      setPruebaSeleccionada(null)
    } catch (error) {
      console.error("Error aprobando prueba:", error)
    }
  }

  const rechazarPrueba = async (prueba) => {
    try {
      await updateDoc(doc(db, "tiendas", prueba.tiendaId, "pruebas", prueba.id), {
        estado: "rechazada",
        fechaRechazo: new Date(),
        comentariosCliente: comentario,
      })

      await cargarDatos()
      setComentario("")
      setPruebaSeleccionada(null)
    } catch (error) {
      console.error("Error rechazando prueba:", error)
    }
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
      case "pendiente_aprobacion":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Portal del Cliente</h1>
          <p className="text-gray-600 mb-6">Bienvenido, {usuarioActual?.nombre}</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Órdenes Activas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {ordenes.filter((o) => o.estado !== "completado").length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Cotizaciones Pendientes</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {cotizaciones.filter((c) => c.estado === "enviada").length}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pruebas Pendientes</p>
                    <p className="text-2xl font-bold text-red-600">
                      {pruebas.filter((p) => p.estado === "pendiente_aprobacion").length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Proyectos Completados</p>
                    <p className="text-2xl font-bold text-green-600">
                      {ordenes.filter((o) => o.estado === "completado").length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="ordenes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ordenes">Mis Órdenes ({ordenes.length})</TabsTrigger>
            <TabsTrigger value="cotizaciones">Mis Cotizaciones ({cotizaciones.length})</TabsTrigger>
            <TabsTrigger value="pruebas">
              Pruebas Pendientes ({pruebas.filter((p) => p.estado === "pendiente_aprobacion").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ordenes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordenes.map((orden) => {
                const diasRestantes = calcularDiasRestantes(orden.fechaEntrega)
                const progreso = obtenerProgresoOrden(orden)

                return (
                  <Card key={`${orden.tiendaId}-${orden.id}`} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{orden.numero}</CardTitle>
                          <p className="text-sm text-gray-600">{orden.tiendaNombre}</p>
                        </div>
                        <Badge className={obtenerColorEstado(orden.estado)}>{orden.estado}</Badge>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progreso</span>
                          <span>{Math.round(progreso)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progreso}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total:</span>
                          <span className="font-semibold">€{orden.totales?.total || "0.00"}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Entrega:</span>
                          <div className="text-right">
                            <span className="text-sm">
                              {new Date(orden.fechaEntrega?.seconds * 1000).toLocaleDateString()}
                            </span>
                            <div
                              className={`text-xs ${diasRestantes < 0 ? "text-red-600" : diasRestantes <= 3 ? "text-orange-600" : "text-green-600"}`}
                            >
                              {diasRestantes < 0
                                ? `${Math.abs(diasRestantes)} días de retraso`
                                : diasRestantes === 0
                                  ? "Entrega hoy"
                                  : `${diasRestantes} días restantes`}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Items:</span>
                          <span className="text-sm">{orden.items?.length || 0}</span>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles de la Orden {orden.numero}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Información General</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Estado:</strong> {orden.estado}
                                    </p>
                                    <p>
                                      <strong>Prioridad:</strong> {orden.prioridad}
                                    </p>
                                    <p>
                                      <strong>Fecha de creación:</strong>{" "}
                                      {new Date(orden.fechaCreacion?.seconds * 1000).toLocaleDateString()}
                                    </p>
                                    <p>
                                      <strong>Fecha de entrega:</strong>{" "}
                                      {new Date(orden.fechaEntrega?.seconds * 1000).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Totales</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Subtotal:</strong> €{orden.totales?.subtotal}
                                    </p>
                                    <p>
                                      <strong>Impuestos:</strong> €{orden.totales?.impuestos}
                                    </p>
                                    <p>
                                      <strong>Total:</strong> €{orden.totales?.total}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Items de la Orden</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {orden.items?.map((item, index) => (
                                    <div key={index} className="border rounded p-3">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium">{item.nombreProducto}</p>
                                          <p className="text-sm text-gray-600">{item.descripcion}</p>
                                          <p className="text-xs text-gray-500">
                                            Cantidad: {item.cantidad}
                                            {item.ancho && item.alto && ` • ${item.ancho}x${item.alto}cm`}
                                          </p>
                                        </div>
                                        <p className="font-semibold">€{item.precioCalculado?.toFixed(2)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {orden.notas && (
                                <div>
                                  <h4 className="font-semibold mb-2">Notas</h4>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{orden.notas}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {ordenes.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No tienes órdenes registradas</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cotizaciones" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cotizaciones.map((cotizacion) => (
                <Card key={`${cotizacion.tiendaId}-${cotizacion.id}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{cotizacion.numero}</CardTitle>
                        <p className="text-sm text-gray-600">{cotizacion.tiendaNombre}</p>
                      </div>
                      <Badge className={obtenerColorEstado(cotizacion.estado)}>{cotizacion.estado}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="font-semibold">€{cotizacion.totales?.total || "0.00"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Válida hasta:</span>
                        <span className="text-sm">
                          {new Date(cotizacion.fechaVencimiento?.seconds * 1000).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Items:</span>
                        <span className="text-sm">{cotizacion.items?.length || 0}</span>
                      </div>

                      <div className="space-y-2 mt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles de la Cotización {cotizacion.numero}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Similar estructura de detalles que las órdenes */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Información General</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Estado:</strong> {cotizacion.estado}
                                    </p>
                                    <p>
                                      <strong>Validez:</strong> {cotizacion.validezDias} días
                                    </p>
                                    <p>
                                      <strong>Fecha de creación:</strong>{" "}
                                      {new Date(cotizacion.fechaCreacion?.seconds * 1000).toLocaleDateString()}
                                    </p>
                                    <p>
                                      <strong>Válida hasta:</strong>{" "}
                                      {new Date(cotizacion.fechaVencimiento?.seconds * 1000).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Totales</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Subtotal:</strong> €{cotizacion.totales?.subtotal}
                                    </p>
                                    <p>
                                      <strong>Descuento:</strong> €{cotizacion.totales?.descuentoGlobal}
                                    </p>
                                    <p>
                                      <strong>Impuestos:</strong> €{cotizacion.totales?.impuestos}
                                    </p>
                                    <p>
                                      <strong>Total:</strong> €{cotizacion.totales?.total}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Items de la Cotización</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {cotizacion.items?.map((item, index) => (
                                    <div key={index} className="border rounded p-3">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium">{item.nombreProducto}</p>
                                          <p className="text-sm text-gray-600">{item.descripcion}</p>
                                          <p className="text-xs text-gray-500">
                                            Cantidad: {item.cantidad}
                                            {item.ancho && item.alto && ` • ${item.ancho}x${item.alto}cm`}
                                            {item.descuento > 0 && ` • Descuento: ${item.descuento}%`}
                                          </p>
                                        </div>
                                        <p className="font-semibold">€{item.precioCalculado?.toFixed(2)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {cotizacion.notas && (
                                <div>
                                  <h4 className="font-semibold mb-2">Notas</h4>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{cotizacion.notas}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {cotizacion.estado === "enviada" && (
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => setCotizacionSeleccionada(cotizacion)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Aprobar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Aprobar Cotización</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p>¿Estás seguro de que quieres aprobar esta cotización?</p>
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm">
                                      <strong>Total:</strong> €{cotizacion.totales?.total}
                                    </p>
                                    <p className="text-sm">
                                      <strong>Items:</strong> {cotizacion.items?.length}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Comentarios (opcional):</label>
                                    <Textarea
                                      value={comentario}
                                      onChange={(e) => setComentario(e.target.value)}
                                      placeholder="Agrega comentarios sobre la aprobación..."
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button onClick={() => aprobarCotizacion(cotizacion)} className="flex-1">
                                      Confirmar Aprobación
                                    </Button>
                                    <Button variant="outline" onClick={() => setCotizacionSeleccionada(null)}>
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 bg-transparent"
                                  onClick={() => setCotizacionSeleccionada(cotizacion)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Rechazar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Rechazar Cotización</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p>¿Por qué rechazas esta cotización?</p>
                                  <div>
                                    <label className="text-sm font-medium">Comentarios (requerido):</label>
                                    <Textarea
                                      value={comentario}
                                      onChange={(e) => setComentario(e.target.value)}
                                      placeholder="Explica qué cambios necesitas..."
                                      rows={3}
                                      required
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => rechazarCotizacion(cotizacion)}
                                      variant="destructive"
                                      className="flex-1"
                                      disabled={!comentario.trim()}
                                    >
                                      Confirmar Rechazo
                                    </Button>
                                    <Button variant="outline" onClick={() => setCotizacionSeleccionada(null)}>
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {cotizaciones.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No tienes cotizaciones registradas</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pruebas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pruebas
                .filter((prueba) => prueba.estado === "pendiente_aprobacion")
                .map((prueba) => (
                  <Card key={`${prueba.tiendaId}-${prueba.id}`} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Star className="w-5 h-5 text-orange-500" />
                            Prueba #{prueba.numero}
                          </CardTitle>
                          <p className="text-sm text-gray-600">{prueba.tiendaNombre}</p>
                          <p className="text-sm text-gray-600">Orden: {prueba.numeroOrden}</p>
                        </div>
                        <Badge className={obtenerColorEstado(prueba.estado)}>Pendiente Aprobación</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
                          <p className="text-sm font-medium text-orange-800">Requiere tu aprobación</p>
                          <p className="text-sm text-orange-700">Revisa los archivos y aprueba o solicita cambios</p>
                        </div>

                        <p className="text-sm">{prueba.descripcion}</p>

                        {prueba.archivos && prueba.archivos.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Archivos para revisión:
                            </p>
                            <div className="space-y-2">
                              {prueba.archivos.map((archivo, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{archivo.nombre}</span>
                                  </div>
                                  <Button size="sm" variant="outline">
                                    <Download className="w-4 h-4 mr-1" />
                                    Descargar
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="flex-1" onClick={() => setPruebaSeleccionada(prueba)}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Aprobar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Aprobar Prueba</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-green-50 p-4 rounded-lg">
                                  <p className="text-green-800 font-medium">¡Perfecto!</p>
                                  <p className="text-green-700 text-sm">
                                    Al aprobar esta prueba, el proyecto continuará con la producción final.
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Comentarios (opcional):</label>
                                  <Textarea
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    placeholder="Agrega comentarios sobre la aprobación..."
                                    rows={3}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={() => aprobarPrueba(prueba)} className="flex-1">
                                    Confirmar Aprobación
                                  </Button>
                                  <Button variant="outline" onClick={() => setPruebaSeleccionada(null)}>
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 bg-transparent"
                                onClick={() => setPruebaSeleccionada(prueba)}
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Solicitar Cambios
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Solicitar Cambios</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                  <p className="text-yellow-800 font-medium">Cambios necesarios</p>
                                  <p className="text-yellow-700 text-sm">
                                    Describe específicamente qué cambios necesitas para aprobar esta prueba.
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Comentarios (requerido):</label>
                                  <Textarea
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    placeholder="Sé específico sobre los cambios que necesitas: colores, tamaños, textos, posiciones, etc."
                                    rows={4}
                                    required
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => rechazarPrueba(prueba)}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={!comentario.trim()}
                                  >
                                    Enviar Solicitud de Cambios
                                  </Button>
                                  <Button variant="outline" onClick={() => setPruebaSeleccionada(null)}>
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
            {pruebas.filter((prueba) => prueba.estado === "pendiente_aprobacion").length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <CheckCircle className="w-16 h-16 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg font-medium">¡Todo al día!</p>
                <p className="text-gray-400">No tienes pruebas pendientes de aprobación</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

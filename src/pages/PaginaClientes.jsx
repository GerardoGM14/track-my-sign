"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Plus, User, Mail, Phone, Building, MapPin, Eye, FileText, Clock } from "lucide-react"

export function PaginaClientes() {
  const { tiendaActual } = useContextoTienda()
  const [clientes, setClientes] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mostrarDialogoCliente, setMostrarDialogoCliente] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    pais: "",
    notas: "",
  })

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
      const clientesRef = collection(db, "tiendas", tiendaActual.id, "clientes")

      const datosCliente = {
        ...nuevoCliente,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      }

      await addDoc(clientesRef, datosCliente)
      await cargarDatos()
      setMostrarDialogoCliente(false)
      setNuevoCliente({
        nombre: "",
        email: "",
        telefono: "",
        empresa: "",
        direccion: "",
        ciudad: "",
        codigoPostal: "",
        pais: "",
        notas: "",
      })
    } catch (error) {
      console.error("Error guardando cliente:", error)
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
        <Dialog open={mostrarDialogoCliente} onOpenChange={setMostrarDialogoCliente}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={nuevoCliente.email}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={nuevoCliente.empresa}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, empresa: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={nuevoCliente.direccion}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={nuevoCliente.ciudad}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, ciudad: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="codigoPostal">Código Postal</Label>
                <Input
                  id="codigoPostal"
                  value={nuevoCliente.codigoPostal}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, codigoPostal: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={nuevoCliente.notas}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, notas: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={guardarCliente} disabled={cargando || !nuevoCliente.nombre || !nuevoCliente.email}>
                {cargando ? "Guardando..." : "Guardar Cliente"}
              </Button>
              <Button variant="outline" onClick={() => setMostrarDialogoCliente(false)}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clientes.map((cliente) => {
          const ordenesCliente = obtenerOrdenesCliente(cliente.email)
          const cotizacionesCliente = obtenerCotizacionesCliente(cliente.email)
          const totalGastado = calcularTotalGastado(cliente.email)

          return (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{cliente.nombre}</CardTitle>
                      {cliente.empresa && <p className="text-sm text-gray-600">{cliente.empresa}</p>}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setClienteSeleccionado(cliente)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{cliente.email}</span>
                  </div>
                  {cliente.telefono && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{cliente.telefono}</span>
                    </div>
                  )}
                  {cliente.direccion && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {cliente.direccion}
                        {cliente.ciudad && `, ${cliente.ciudad}`}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-600">{cotizacionesCliente.length}</p>
                      <p className="text-xs text-gray-500">Cotizaciones</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">{ordenesCliente.length}</p>
                      <p className="text-xs text-gray-500">Órdenes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">€{totalGastado.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
        <div className="text-center py-8">
          <p className="text-gray-500">No hay clientes registrados</p>
          <Button className="mt-4" onClick={() => setMostrarDialogoCliente(true)}>
            Agregar Primer Cliente
          </Button>
        </div>
      )}
    </div>
  )
}

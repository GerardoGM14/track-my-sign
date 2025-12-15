"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
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
import { Plus, User, Users, Mail, Phone, Building, MapPin, Eye, FileText, Clock, Edit, Trash2 } from "lucide-react"
import { toast } from "../hooks/user-toast"


export function PaginaClientes() {
  const { tiendaActual } = useContextoTienda()
  const [clientes, setClientes] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mostrarDialogoCliente, setMostrarDialogoCliente] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [clienteEditando, setClienteEditando] = useState(null)

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
          description: "El cliente se ha creado exitosamente",
        })
      }

      await cargarDatos()
      setMostrarDialogoCliente(false)
      setClienteEditando(null)
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
      toast({
        title: "Error",
        description: "No se pudo guardar el cliente. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const editarCliente = (cliente) => {
    setClienteEditando(cliente)
    setNuevoCliente({
      nombre: cliente.nombre || "",
      email: cliente.email || "",
      telefono: cliente.telefono || "",
      empresa: cliente.empresa || "",
      direccion: cliente.direccion || "",
      ciudad: cliente.ciudad || "",
      codigoPostal: cliente.codigoPostal || "",
      pais: cliente.pais || "",
      notas: cliente.notas || "",
    })
    setMostrarDialogoCliente(true)
  }

  const eliminarCliente = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setCargando(true)
      await deleteDoc(doc(db, "tiendas", tiendaActual.id, "clientes", id))
      await cargarDatos()
      toast({
        title: "Cliente eliminado",
        description: "El cliente se ha eliminado correctamente",
      })
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
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Gestión de Clientes</h1>
          <p className="text-sm text-gray-600 mt-1 leading-tight">Administra tu base de datos de clientes</p>
        </div>
        <Button 
          onClick={() => setMostrarDialogoCliente(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
        
        <Dialog open={mostrarDialogoCliente} onOpenChange={setMostrarDialogoCliente}>
          <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{clienteEditando ? "Editar Cliente" : "Agregar Nuevo Cliente"}</DialogTitle>
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
            <div className="flex gap-2 mt-4 pt-4">
              <Button 
                onClick={guardarCliente} 
                disabled={cargando || !nuevoCliente.nombre || !nuevoCliente.email}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {cargando ? "Guardando..." : "Guardar Cliente"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setMostrarDialogoCliente(false)
                  setClienteEditando(null)
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
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {clientes.map((cliente) => {
          const ordenesCliente = obtenerOrdenesCliente(cliente.email)
          const cotizacionesCliente = obtenerCotizacionesCliente(cliente.email)
          const totalGastado = calcularTotalGastado(cliente.email)

          return (
            <Card 
              key={cliente.id} 
              className="border border-gray-200 rounded-xl shadow-md bg-white hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-gray-900 leading-tight truncate">
                        {cliente.nombre}
                      </CardTitle>
                      {cliente.empresa && (
                        <p className="text-sm text-gray-600 mt-1 leading-tight truncate">{cliente.empresa}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => editarCliente(cliente)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setClienteSeleccionado(cliente)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => eliminarCliente(cliente.id)}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                  {cliente.telefono && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{cliente.telefono}</span>
                    </div>
                  )}
                  {cliente.direccion && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {cliente.direccion}
                        {cliente.ciudad && `, ${cliente.ciudad}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-base font-semibold text-blue-600 leading-tight">{cotizacionesCliente.length}</p>
                    <p className="text-xs text-gray-500 leading-tight">Cotizaciones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-green-600 leading-tight">{ordenesCliente.length}</p>
                    <p className="text-xs text-gray-500 leading-tight">Órdenes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-gray-900 leading-tight">€{totalGastado.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 leading-tight">Total</p>
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
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando clientes...</p>
        </div>
      )}
    </div>
  )
}

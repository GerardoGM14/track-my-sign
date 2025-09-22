"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { usarAuth } from "../contexts/ContextoAuth"
import { usarTienda } from "../contexts/ContextoTienda"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { FileText, DollarSign, CreditCard, Download, Send, Plus, Eye, TrendingUp } from "lucide-react"

export function PaginaFacturacion() {
  const { usuario } = usarAuth()
  const { tiendaActual } = usarTienda()
  const [facturas, setFacturas] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarNuevaFactura, setMostrarNuevaFactura] = useState(false)
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null)
  const [estadisticas, setEstadisticas] = useState({
    totalFacturado: 0,
    facturasPendientes: 0,
    facturasPagadas: 0,
    ingresosMes: 0,
  })

  // Formulario nueva factura
  const [nuevaFactura, setNuevaFactura] = useState({
    ordenId: "",
    clienteId: "",
    items: [],
    subtotal: 0,
    impuestos: 0,
    total: 0,
    fechaVencimiento: "",
    notas: "",
    metodoPago: "stripe",
  })

  useEffect(() => {
    if (tiendaActual?.id) {
      cargarFacturas()
      cargarOrdenes()
      calcularEstadisticas()
    }
  }, [tiendaActual])

  const cargarFacturas = async () => {
    try {
      const q = query(
        collection(db, "facturas"),
        where("tiendaId", "==", tiendaActual.id),
        orderBy("fechaCreacion", "desc"),
      )
      const snapshot = await getDocs(q)
      const facturasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setFacturas(facturasData)
    } catch (error) {
      console.error("Error cargando facturas:", error)
    }
  }

  const cargarOrdenes = async () => {
    try {
      const q = query(
        collection(db, "ordenes"),
        where("tiendaId", "==", tiendaActual.id),
        where("estado", "==", "completado"),
      )
      const snapshot = await getDocs(q)
      const ordenesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setOrdenes(ordenesData)
    } catch (error) {
      console.error("Error cargando órdenes:", error)
    } finally {
      setCargando(false)
    }
  }

  const calcularEstadisticas = async () => {
    try {
      const q = query(collection(db, "facturas"), where("tiendaId", "==", tiendaActual.id))
      const snapshot = await getDocs(q)
      const facturasData = snapshot.docs.map((doc) => doc.data())

      const totalFacturado = facturasData.reduce((sum, f) => sum + f.total, 0)
      const facturasPendientes = facturasData.filter((f) => f.estado === "pendiente").length
      const facturasPagadas = facturasData.filter((f) => f.estado === "pagado").length

      const fechaActual = new Date()
      const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1)
      const ingresosMes = facturasData
        .filter((f) => f.estado === "pagado" && new Date(f.fechaPago) >= inicioMes)
        .reduce((sum, f) => sum + f.total, 0)

      setEstadisticas({
        totalFacturado,
        facturasPendientes,
        facturasPagadas,
        ingresosMes,
      })
    } catch (error) {
      console.error("Error calculando estadísticas:", error)
    }
  }

  const crearFactura = async () => {
    try {
      const ordenSeleccionada = ordenes.find((o) => o.id === nuevaFactura.ordenId)
      if (!ordenSeleccionada) return

      const facturaData = {
        ...nuevaFactura,
        tiendaId: tiendaActual.id,
        numeroFactura: `FAC-${Date.now()}`,
        estado: "pendiente",
        fechaCreacion: new Date().toISOString(),
        fechaVencimiento:
          nuevaFactura.fechaVencimiento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        clienteNombre: ordenSeleccionada.clienteNombre,
        clienteEmail: ordenSeleccionada.clienteEmail,
        items: ordenSeleccionada.items,
        subtotal: ordenSeleccionada.total * 0.85, // Asumiendo 15% de impuestos
        impuestos: ordenSeleccionada.total * 0.15,
        total: ordenSeleccionada.total,
      }

      await addDoc(collection(db, "facturas"), facturaData)

      // Actualizar estado de la orden
      await updateDoc(doc(db, "ordenes", nuevaFactura.ordenId), {
        facturado: true,
        fechaFacturacion: new Date().toISOString(),
      })

      setMostrarNuevaFactura(false)
      setNuevaFactura({
        ordenId: "",
        clienteId: "",
        items: [],
        subtotal: 0,
        impuestos: 0,
        total: 0,
        fechaVencimiento: "",
        notas: "",
        metodoPago: "stripe",
      })
      cargarFacturas()
      calcularEstadisticas()
    } catch (error) {
      console.error("Error creando factura:", error)
    }
  }

  const procesarPagoStripe = async (facturaId) => {
    try {
      // Aquí iría la integración real con Stripe
      // Por ahora simulamos el proceso
      console.log("Procesando pago con Stripe para factura:", facturaId)

      // Simular respuesta exitosa de Stripe
      await updateDoc(doc(db, "facturas", facturaId), {
        estado: "pagado",
        fechaPago: new Date().toISOString(),
        metodoPago: "stripe",
        transaccionId: `stripe_${Date.now()}`,
      })

      cargarFacturas()
      calcularEstadisticas()
      alert("Pago procesado exitosamente")
    } catch (error) {
      console.error("Error procesando pago:", error)
      alert("Error procesando el pago")
    }
  }

  const generarPDF = (factura) => {
    // Aquí iría la generación real del PDF
    console.log("Generando PDF para factura:", factura.numeroFactura)
    alert("PDF generado (funcionalidad simulada)")
  }

  const enviarFactura = async (facturaId) => {
    try {
      await updateDoc(doc(db, "facturas", facturaId), {
        enviado: true,
        fechaEnvio: new Date().toISOString(),
      })
      cargarFacturas()
      alert("Factura enviada por email")
    } catch (error) {
      console.error("Error enviando factura:", error)
    }
  }

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "pagado":
        return "bg-green-100 text-green-800"
      case "vencido":
        return "bg-red-100 text-red-800"
      case "cancelado":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando facturación...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Facturación</h1>
          <p className="text-gray-600">Gestiona facturas, pagos y reportes financieros</p>
        </div>
        <Dialog open={mostrarNuevaFactura} onOpenChange={setMostrarNuevaFactura}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Factura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Factura</DialogTitle>
              <DialogDescription>Selecciona una orden completada para generar la factura</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orden">Orden</Label>
                <Select
                  value={nuevaFactura.ordenId}
                  onValueChange={(value) => setNuevaFactura((prev) => ({ ...prev, ordenId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar orden completada" />
                  </SelectTrigger>
                  <SelectContent>
                    {ordenes
                      .filter((o) => !o.facturado)
                      .map((orden) => (
                        <SelectItem key={orden.id} value={orden.id}>
                          {orden.numeroOrden} - {orden.clienteNombre} - ${orden.total}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
                <Input
                  id="fechaVencimiento"
                  type="date"
                  value={nuevaFactura.fechaVencimiento}
                  onChange={(e) =>
                    setNuevaFactura((prev) => ({
                      ...prev,
                      fechaVencimiento: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  placeholder="Notas adicionales para la factura"
                  value={nuevaFactura.notas}
                  onChange={(e) =>
                    setNuevaFactura((prev) => ({
                      ...prev,
                      notas: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setMostrarNuevaFactura(false)}>
                  Cancelar
                </Button>
                <Button onClick={crearFactura} disabled={!nuevaFactura.ordenId}>
                  Crear Factura
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estadisticas.totalFacturado.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.facturasPendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pagadas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.facturasPagadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estadisticas.ingresosMes.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="facturas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="facturas">Facturas</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="facturas" className="space-y-4">
          <div className="grid gap-4">
            {facturas.map((factura) => (
              <Card key={factura.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{factura.numeroFactura}</CardTitle>
                      <CardDescription>
                        Cliente: {factura.clienteNombre} • Creada:{" "}
                        {new Date(factura.fechaCreacion).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={obtenerColorEstado(factura.estado)}>
                        {factura.estado.charAt(0).toUpperCase() + factura.estado.slice(1)}
                      </Badge>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${factura.total.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">
                          Vence: {new Date(factura.fechaVencimiento).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Subtotal: ${factura.subtotal.toLocaleString()} • Impuestos: ${factura.impuestos.toLocaleString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => generarPDF(factura)}>
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => enviarFactura(factura.id)}>
                        <Send className="w-4 h-4 mr-1" />
                        Enviar
                      </Button>
                      {factura.estado === "pendiente" && (
                        <Button size="sm" onClick={() => procesarPagoStripe(factura.id)}>
                          <CreditCard className="w-4 h-4 mr-1" />
                          Procesar Pago
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setFacturaSeleccionada(factura)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pagos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Pagos</CardTitle>
              <CardDescription>Configura los métodos de pago y integración con Stripe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Clave Pública de Stripe</Label>
                <Input placeholder="pk_test_..." />
              </div>
              <div>
                <Label>Clave Secreta de Stripe</Label>
                <Input type="password" placeholder="sk_test_..." />
              </div>
              <div>
                <Label>Webhook Endpoint</Label>
                <Input placeholder="https://tu-dominio.com/webhook/stripe" />
              </div>
              <Button>Guardar Configuración</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reportes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reporte de Ingresos</CardTitle>
                <CardDescription>Ingresos por período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Este mes:</span>
                    <span className="font-bold">${estadisticas.ingresosMes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-bold">${estadisticas.totalFacturado.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Estado de Facturas</CardTitle>
                <CardDescription>Resumen por estado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pendientes:</span>
                    <span className="font-bold">{estadisticas.facturasPendientes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pagadas:</span>
                    <span className="font-bold">{estadisticas.facturasPagadas}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalle de factura */}
      {facturaSeleccionada && (
        <Dialog open={!!facturaSeleccionada} onOpenChange={() => setFacturaSeleccionada(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Factura {facturaSeleccionada.numeroFactura}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Información del Cliente</h3>
                  <p>{facturaSeleccionada.clienteNombre}</p>
                  <p>{facturaSeleccionada.clienteEmail}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Detalles de Facturación</h3>
                  <p>Fecha: {new Date(facturaSeleccionada.fechaCreacion).toLocaleDateString()}</p>
                  <p>Vencimiento: {new Date(facturaSeleccionada.fechaVencimiento).toLocaleDateString()}</p>
                  <p>Estado: {facturaSeleccionada.estado}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3">Descripción</th>
                        <th className="text-right p-3">Cantidad</th>
                        <th className="text-right p-3">Precio</th>
                        <th className="text-right p-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturaSeleccionada.items?.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{item.descripcion}</td>
                          <td className="text-right p-3">{item.cantidad}</td>
                          <td className="text-right p-3">${item.precio}</td>
                          <td className="text-right p-3">${item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div>Subtotal: ${facturaSeleccionada.subtotal.toLocaleString()}</div>
                <div>Impuestos: ${facturaSeleccionada.impuestos.toLocaleString()}</div>
                <div className="text-xl font-bold">Total: ${facturaSeleccionada.total.toLocaleString()}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

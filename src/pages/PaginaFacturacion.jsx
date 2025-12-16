"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoAuth } from "../contexts/ContextoAuth"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { ComponentePagoStripe } from "../components/ComponentePagoStripe"
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
import {
  FileText,
  DollarSign,
  CreditCard,
  Download,
  Send,
  Plus,
  Eye,
  TrendingUp,
  Settings,
  CheckCircle,
  AlertTriangle,
  Receipt,
} from "lucide-react"
import { toast } from "../hooks/user-toast"

export function PaginaFacturacion() {
  const { usuarioActual } = useContextoAuth()
  const { tiendaActual } = useContextoTienda()
  const [facturas, setFacturas] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarNuevaFactura, setMostrarNuevaFactura] = useState(false)
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null)
  const [mostrarPago, setMostrarPago] = useState(false)
  const [facturaParaPago, setFacturaParaPago] = useState(null)

  const [configuracionStripe, setConfiguracionStripe] = useState({
    publishableKey: "",
    secretKey: "",
    webhookEndpoint: "",
    activo: false,
  })

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
      cargarConfiguracionStripe()
    }
  }, [tiendaActual])

  const cargarConfiguracionStripe = async () => {
    try {
      const configRef = collection(db, "tiendas", tiendaActual.id, "configuracion")
      const configQuery = query(configRef, where("tipo", "==", "stripe"))
      const configSnapshot = await getDocs(configQuery)

      if (!configSnapshot.empty) {
        const configData = configSnapshot.docs[0].data()
        setConfiguracionStripe(configData)
      }
    } catch (error) {
      console.error("Error cargando configuración de Stripe:", error)
    }
  }

  const guardarConfiguracionStripe = async () => {
    try {
      const configRef = collection(db, "tiendas", tiendaActual.id, "configuracion")
      await addDoc(configRef, {
        ...configuracionStripe,
        tipo: "stripe",
        fechaActualizacion: new Date(),
        actualizadoPor: usuarioActual.nombre,
      })
      alert("Configuración de Stripe guardada correctamente")
    } catch (error) {
      console.error("Error guardando configuración:", error)
      alert("Error guardando la configuración")
    }
  }

  const cargarFacturas = async () => {
    try {
      const q = query(collection(db, "tiendas", tiendaActual.id, "facturas"), orderBy("fechaCreacion", "desc"))
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
      const q = query(collection(db, "tiendas", tiendaActual.id, "ordenes"), where("estado", "==", "completado"))
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
      const q = query(collection(db, "tiendas", tiendaActual.id, "facturas"))
      const snapshot = await getDocs(q)
      const facturasData = snapshot.docs.map((doc) => doc.data())

      const totalFacturado = facturasData.reduce((sum, f) => sum + (f.total || 0), 0)
      const facturasPendientes = facturasData.filter((f) => f.estado === "pendiente").length
      const facturasPagadas = facturasData.filter((f) => f.estado === "pagado").length

      const fechaActual = new Date()
      const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1)
      const ingresosMes = facturasData
        .filter((f) => f.estado === "pagado" && f.fechaPago && new Date(f.fechaPago) >= inicioMes)
        .reduce((sum, f) => sum + (f.total || 0), 0)

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

      const numeroFactura = `FAC-${Date.now()}`
      const facturaData = {
        ...nuevaFactura,
        numeroFactura,
        estado: "pendiente",
        fechaCreacion: new Date(),
        fechaVencimiento: nuevaFactura.fechaVencimiento
          ? new Date(nuevaFactura.fechaVencimiento)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cliente: ordenSeleccionada.cliente,
        items: ordenSeleccionada.items,
        subtotal: Number.parseFloat(ordenSeleccionada.totales?.baseImponible || 0),
        impuestos: Number.parseFloat(ordenSeleccionada.totales?.impuestos || 0),
        total: Number.parseFloat(ordenSeleccionada.totales?.total || 0),
      }

      const facturasRef = collection(db, "tiendas", tiendaActual.id, "facturas")
      await addDoc(facturasRef, facturaData)

      // Actualizar estado de la orden
      await updateDoc(doc(db, "tiendas", tiendaActual.id, "ordenes", nuevaFactura.ordenId), {
        facturado: true,
        numeroFactura,
        fechaFacturacion: new Date(),
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
      toast({
        title: "Factura creada",
        description: "La factura se ha creado exitosamente",
      })
    } catch (error) {
      console.error("Error creando factura:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la factura. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const iniciarPagoStripe = (factura) => {
    if (!configuracionStripe.activo || !configuracionStripe.publishableKey) {
      alert("Stripe no está configurado correctamente")
      return
    }
    setFacturaParaPago(factura)
    setMostrarPago(true)
  }

  const manejarPagoExitoso = async (datosPago) => {
    try {
      await updateDoc(doc(db, "tiendas", tiendaActual.id, "facturas", facturaParaPago.id), {
        estado: "pagado",
        fechaPago: new Date(),
        metodoPago: "stripe",
        transaccionId: datosPago.transaccionId,
        montoPagado: datosPago.monto,
        monedaPago: datosPago.moneda,
      })

      cargarFacturas()
      calcularEstadisticas()
      setMostrarPago(false)
      setFacturaParaPago(null)
    } catch (error) {
      console.error("Error actualizando factura:", error)
    }
  }

  const manejarErrorPago = (error) => {
    console.error("Error en pago:", error)
    alert("Error procesando el pago. Por favor, inténtalo de nuevo.")
  }

  const generarPDF = (factura) => {
    // Aquí iría la generación real del PDF
    console.log("Generando PDF para factura:", factura.numeroFactura)
    alert("PDF generado (funcionalidad simulada)")
  }

  const enviarFactura = async (facturaId) => {
    try {
      await updateDoc(doc(db, "tiendas", tiendaActual.id, "facturas", facturaId), {
        enviado: true,
        fechaEnvio: new Date(),
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
    <div className="space-y-6 min-h-full px-18">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Facturación</h1>
          <p className="text-sm text-gray-600 mt-1 leading-tight">Gestiona facturas, pagos y reportes financieros</p>
        </div>
        <Button 
          onClick={() => setMostrarNuevaFactura(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
        
        <Dialog open={mostrarNuevaFactura} onOpenChange={setMostrarNuevaFactura}>
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
                          {orden.numero} - {orden.cliente?.nombre} - €{orden.totales?.total}
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
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setMostrarNuevaFactura(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={crearFactura} 
                  disabled={!nuevaFactura.ordenId}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Crear Factura
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 leading-tight">Total Facturado</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 leading-tight">€{estadisticas.totalFacturado.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 leading-tight">Facturas Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 leading-tight">{estadisticas.facturasPendientes}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 leading-tight">Facturas Pagadas</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 leading-tight">{estadisticas.facturasPagadas}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 leading-tight">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 leading-tight">€{estadisticas.ingresosMes.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="facturas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="facturas">Facturas</TabsTrigger>
          <TabsTrigger value="pagos">Configuración de Pagos</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="facturas" className="space-y-4">
          <div className="grid gap-4">
            {facturas.map((factura) => (
              <Card 
                key={factura.id} 
                className="border border-gray-200 rounded-xl shadow-md bg-white hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold text-gray-900 leading-tight">
                          {factura.numeroFactura || "Sin número"}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1 leading-tight">
                          Cliente: {factura.cliente?.nombre || "Sin cliente"} • Creada:{" "}
                          {factura.fechaCreacion?.seconds 
                            ? new Date(factura.fechaCreacion.seconds * 1000).toLocaleDateString()
                            : "Fecha no disponible"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={`${obtenerColorEstado(factura.estado)} capitalize`}>
                        {factura.estado}
                      </Badge>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900 leading-tight">€{factura.total?.toLocaleString() || "0.00"}</div>
                        <div className="text-xs text-gray-500 leading-tight">
                          Vence: {factura.fechaVencimiento?.seconds 
                            ? new Date(factura.fechaVencimiento.seconds * 1000).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Subtotal: €{factura.subtotal?.toLocaleString() || "0.00"} • Impuestos: €
                      {factura.impuestos?.toLocaleString() || "0.00"}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => generarPDF(factura)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => enviarFactura(factura.id)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Enviar
                      </Button>
                      {factura.estado === "pendiente" && (
                        <Button 
                          size="sm" 
                          onClick={() => iniciarPagoStripe(factura)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Procesar Pago
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setFacturaSeleccionada(factura)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="w-3 h-3 mr-1" />
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
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración de Stripe
              </CardTitle>
              <CardDescription>Configura los métodos de pago y integración con Stripe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center gap-2">
                  {configuracionStripe.activo ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                  <span className="font-medium">
                    Estado: {configuracionStripe.activo ? "Configurado" : "Pendiente configuración"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {configuracionStripe.activo
                    ? "Stripe está configurado y listo para procesar pagos"
                    : "Completa la configuración para habilitar pagos con Stripe"}
                </p>
              </div>

              <div>
                <Label>Clave Pública de Stripe</Label>
                <Input
                  placeholder="pk_test_..."
                  value={configuracionStripe.publishableKey}
                  onChange={(e) =>
                    setConfiguracionStripe((prev) => ({
                      ...prev,
                      publishableKey: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comienza con pk_test_ para pruebas o pk_live_ para producción
                </p>
              </div>
              <div>
                <Label>Clave Secreta de Stripe</Label>
                <Input
                  type="password"
                  placeholder="sk_test_..."
                  value={configuracionStripe.secretKey}
                  onChange={(e) =>
                    setConfiguracionStripe((prev) => ({
                      ...prev,
                      secretKey: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comienza con sk_test_ para pruebas o sk_live_ para producción
                </p>
              </div>
              <div>
                <Label>Webhook Endpoint</Label>
                <Input
                  placeholder="https://tu-dominio.com/webhook/stripe"
                  value={configuracionStripe.webhookEndpoint}
                  onChange={(e) =>
                    setConfiguracionStripe((prev) => ({
                      ...prev,
                      webhookEndpoint: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-500 mt-1">URL donde Stripe enviará las notificaciones de eventos</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activarStripe"
                  checked={configuracionStripe.activo}
                  onChange={(e) =>
                    setConfiguracionStripe((prev) => ({
                      ...prev,
                      activo: e.target.checked,
                    }))
                  }
                />
                <Label htmlFor="activarStripe">Activar integración con Stripe</Label>
              </div>
              <Button onClick={guardarConfiguracionStripe}>Guardar Configuración</Button>
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
                    <span className="font-bold">€{estadisticas.ingresosMes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-bold">€{estadisticas.totalFacturado.toLocaleString()}</span>
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

      <Dialog open={mostrarPago} onOpenChange={setMostrarPago}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
            <DialogDescription>Procesa el pago de la factura {facturaParaPago?.numeroFactura}</DialogDescription>
          </DialogHeader>
          {facturaParaPago && (
            <ComponentePagoStripe
              factura={facturaParaPago}
              configuracionStripe={configuracionStripe}
              onPagoExitoso={manejarPagoExitoso}
              onPagoError={manejarErrorPago}
            />
          )}
        </DialogContent>
      </Dialog>

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
                  <p>{facturaSeleccionada.cliente?.nombre}</p>
                  <p>{facturaSeleccionada.cliente?.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Detalles de Facturación</h3>
                  <p>Fecha: {new Date(facturaSeleccionada.fechaCreacion?.seconds * 1000).toLocaleDateString()}</p>
                  <p>
                    Vencimiento: {new Date(facturaSeleccionada.fechaVencimiento?.seconds * 1000).toLocaleDateString()}
                  </p>
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
                          <td className="p-3">{item.nombreProducto}</td>
                          <td className="text-right p-3">{item.cantidad}</td>
                          <td className="text-right p-3">€{item.precioCalculado?.toFixed(2)}</td>
                          <td className="text-right p-3">€{(item.precioCalculado * item.cantidad)?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div>Subtotal: €{facturaSeleccionada.subtotal?.toLocaleString()}</div>
                <div>Impuestos: €{facturaSeleccionada.impuestos?.toLocaleString()}</div>
                <div className="text-xl font-bold">Total: €{facturaSeleccionada.total?.toLocaleString()}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

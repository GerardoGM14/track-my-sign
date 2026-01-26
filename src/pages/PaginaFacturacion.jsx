"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, getDoc } from "firebase/firestore"
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
  X,
} from "lucide-react"
import { toast } from "../hooks/user-toast"
import { LoadingSpinner } from "../components/ui/loading-spinner"

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
      const stripeRef = doc(db, "tiendas", tiendaActual.id, "configuracion", "stripe")
      const stripeSnap = await getDoc(stripeRef)

      if (stripeSnap.exists()) {
        const configData = stripeSnap.data()
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
    const ventanaImpresion = window.open('', '_blank')
    if (!ventanaImpresion) {
      alert("Por favor permite las ventanas emergentes para generar la factura.")
      return
    }

    const contenidoHTML = `
      <html>
        <head>
          <title>Factura ${factura.numeroFactura}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .info-empresa { margin-top: 10px; font-size: 14px; color: #666; }
            .info-factura { text-align: right; }
            .info-factura h1 { margin: 0; color: #111; font-size: 32px; letter-spacing: 1px; }
            .detalles-factura { margin-top: 10px; font-size: 14px; }
            .seccion-cliente { margin-bottom: 40px; }
            .titulo-seccion { font-size: 12px; text-transform: uppercase; color: #888; font-weight: bold; margin-bottom: 5px; }
            .tabla { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; }
            .tabla th { background-color: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600; font-size: 14px; }
            .tabla td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .text-right { text-align: right; }
            .totales { display: flex; justify-content: flex-end; }
            .tabla-totales { width: 300px; }
            .tabla-totales td { padding: 8px 0; border-bottom: 1px solid #eee; }
            .tabla-totales .total-final { font-size: 18px; font-weight: bold; color: #111; border-top: 2px solid #333; border-bottom: none; padding-top: 15px; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">${tiendaActual.nombre}</div>
              <div class="info-empresa">
                <p>Servicios de Imprenta y Rotulación</p>
              </div>
            </div>
            <div class="info-factura">
              <h1>FACTURA</h1>
              <div class="detalles-factura">
                <p><strong>Número:</strong> ${factura.numeroFactura}</p>
                <p><strong>Fecha:</strong> ${new Date(factura.fechaCreacion.seconds * 1000).toLocaleDateString()}</p>
                <p><strong>Vencimiento:</strong> ${factura.fechaVencimiento ? new Date(factura.fechaVencimiento.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div class="seccion-cliente">
            <div class="titulo-seccion">Facturar a:</div>
            <p style="font-weight: bold; font-size: 16px; margin: 0 0 5px 0;">${factura.cliente?.nombre || 'Cliente General'}</p>
            <p style="margin: 0;">${factura.cliente?.empresa ? factura.cliente.empresa + '<br>' : ''}</p>
            <p style="margin: 0;">${factura.cliente?.email || ''}</p>
            <p style="margin: 0;">${factura.cliente?.telefono || ''}</p>
          </div>

          <table class="tabla">
            <thead>
              <tr>
                <th>Descripción</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Precio Unitario</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${factura.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.nombre || 'Item'}</strong>
                    ${item.descripcion ? `<br><span style="color: #666; font-size: 12px;">${item.descripcion}</span>` : ''}
                  </td>
                  <td class="text-right">${item.cantidad}</td>
                  <td class="text-right">€${Number(item.precioUnitario).toFixed(2)}</td>
                  <td class="text-right">€${Number(item.total).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totales">
            <table class="tabla-totales">
              <tr>
                <td>Subtotal</td>
                <td class="text-right">€${Number(factura.subtotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Impuestos (IVA)</td>
                <td class="text-right">€${Number(factura.impuestos).toFixed(2)}</td>
              </tr>
              <tr class="total-final">
                <td class="total-final">Total</td>
                <td class="total-final text-right">€${Number(factura.total).toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            <p>Gracias por su preferencia.</p>
            <p>${tiendaActual.nombre} - Sistema de Gestión TrackMySign</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `
    
    ventanaImpresion.document.write(contenidoHTML)
    ventanaImpresion.document.close()
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
    return <LoadingSpinner texto="Cargando facturación..." />
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

      {/* Overlay oscuro */}
      {mostrarNuevaFactura && (
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
          onClick={() => setMostrarNuevaFactura(false)}
        />
      )}

      {/* Sidebar Nueva Factura */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${
          mostrarNuevaFactura ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col bg-gray-50">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Nueva Factura</h2>
                  <p className="text-sm text-gray-500">Genera una factura desde una orden</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarNuevaFactura(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="orden" className="text-sm font-medium text-gray-700">Orden</Label>
                <Select
                  value={nuevaFactura.ordenId}
                  onValueChange={(value) => setNuevaFactura((prev) => ({ ...prev, ordenId: value }))}
                >
                  <SelectTrigger className="mt-1 bg-white">
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
                {ordenes.filter((o) => !o.facturado).length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">No hay órdenes pendientes de facturar</p>
                )}
              </div>

              <div>
                <Label htmlFor="fechaVencimiento" className="text-sm font-medium text-gray-700">Fecha de Vencimiento</Label>
                <Input
                  id="fechaVencimiento"
                  type="date"
                  className="mt-1 bg-white"
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
                <Label htmlFor="notas" className="text-sm font-medium text-gray-700">Notas</Label>
                <Textarea
                  id="notas"
                  placeholder="Notas adicionales para la factura"
                  className="mt-1 bg-white min-h-[100px]"
                  value={nuevaFactura.notas}
                  onChange={(e) =>
                    setNuevaFactura((prev) => ({
                      ...prev,
                      notas: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-white sticky bottom-0">
            <div className="flex gap-3">
              <Button 
                onClick={crearFactura} 
                disabled={!nuevaFactura.ordenId}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                Crear Factura
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setMostrarNuevaFactura(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>

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

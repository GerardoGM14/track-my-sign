"use client"
import { Link, useParams } from "react-router-dom"
import { FileText, Clock, CheckCircle, Eye, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { NavLinkViewTransition } from "../components/NavLinkViewTransition"

export default function DashboardCustomer() {
  const { slugTienda } = useParams()

  const misCotizaciones = [
    {
      id: "COT-001",
      proyecto: "Letrero Principal Restaurante",
      estado: "Aprobada",
      fecha: "2024-01-15",
      valor: 850,
    },
    {
      id: "COT-002",
      proyecto: "Señalización Interior",
      estado: "Pendiente",
      fecha: "2024-01-18",
      valor: 1200,
    },
    {
      id: "COT-003",
      proyecto: "Banner Promocional",
      estado: "En Revisión",
      fecha: "2024-01-20",
      valor: 350,
    },
  ]

  const misOrdenes = [
    {
      id: "ORD-001",
      proyecto: "Letrero Principal Restaurante",
      estado: "En Producción",
      progreso: 75,
      fechaEntrega: "2024-01-25",
    },
    {
      id: "ORD-002",
      proyecto: "Rótulo Exterior",
      estado: "Diseño",
      progreso: 25,
      fechaEntrega: "2024-02-01",
    },
  ]

  const obtenerColorEstado = (estado) => {
    const colores = {
      Aprobada: "bg-green-100 text-green-800",
      Pendiente: "bg-yellow-100 text-yellow-800",
      "En Revisión": "bg-blue-100 text-blue-800",
      "En Producción": "bg-purple-100 text-purple-800",
      Diseño: "bg-orange-100 text-orange-800",
    }
    return colores[estado] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Portal</h1>
          <p className="text-muted-foreground">Seguimiento de tus proyectos y cotizaciones</p>
        </div>
        <Button asChild>
          <NavLinkViewTransition to={`/${slugTienda}/cotizaciones/solicitar`}>Solicitar Cotización</NavLinkViewTransition>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{misCotizaciones.length}</div>
            <p className="text-xs text-muted-foreground">Total solicitadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{misOrdenes.length}</div>
            <p className="text-xs text-muted-foreground">Proyectos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Proyectos finalizados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mis Cotizaciones</CardTitle>
          <CardDescription>Estado actual de tus solicitudes de cotización</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {misCotizaciones.map((cotizacion) => (
              <div key={cotizacion.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{cotizacion.proyecto}</p>
                  <p className="text-sm text-muted-foreground">
                    {cotizacion.id} • {cotizacion.fecha}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={obtenerColorEstado(cotizacion.estado)}>{cotizacion.estado}</Badge>
                  <p className="font-medium">${cotizacion.valor}</p>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos en Proceso</CardTitle>
          <CardDescription>Seguimiento del progreso de tus órdenes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {misOrdenes.map((orden) => (
              <div key={orden.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{orden.proyecto}</p>
                    <p className="text-sm text-muted-foreground">
                      {orden.id} • Entrega: {orden.fechaEntrega}
                    </p>
                  </div>
                  <Badge className={obtenerColorEstado(orden.estado)}>{orden.estado}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{orden.progreso}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${orden.progreso}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Prueba
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>¿Qué puedes hacer?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" asChild className="h-20 flex-col bg-transparent">
              <NavLinkViewTransition to={`/${slugTienda}/cotizaciones/solicitar`}>
                <FileText className="mb-2 h-6 w-6" />
                Solicitar Nueva Cotización
              </NavLinkViewTransition>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col bg-transparent">
              <NavLinkViewTransition to={`/${slugTienda}/cotizaciones`}>
                <Eye className="mb-2 h-6 w-6" />
                Ver Todas Mis Cotizaciones
              </NavLinkViewTransition>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

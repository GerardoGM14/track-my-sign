"use client"
import { Link, useParams } from "react-router-dom"
import {
  Package,
  DollarSign,
  FileText,
  ClipboardList,
  Users,
  Receipt,
  TrendingUp,
  Clock,
  Star,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { NavLinkViewTransition } from "../components/NavLinkViewTransition"

export default function DashboardAdmin() {
  const { slugTienda } = useParams()

  const metricas = {
    productos: 45,
    cotizacionesPendientes: 12,
    ordenes: 28,
    clientes: 156,
    ingresosMes: 15420,
    tiempoPromedio: "2.5 días",
    satisfaccion: 4.8,
  }

  const ordenesRecientes = [
    { id: "ORD-001", cliente: "Restaurante El Buen Sabor", estado: "En Producción", valor: 850 },
    { id: "ORD-002", cliente: "Clínica Dental Sonrisa", estado: "Diseño", valor: 1200 },
    { id: "ORD-003", cliente: "Tienda Fashion Style", estado: "Entregado", valor: 650 },
    { id: "ORD-004", cliente: "Oficina Legal & Asociados", estado: "Cotización", valor: 2100 },
  ]

  const obtenerColorEstado = (estado) => {
    const colores = {
      "En Producción": "bg-blue-100 text-blue-800",
      Diseño: "bg-yellow-100 text-yellow-800",
      Entregado: "bg-green-100 text-green-800",
      Cotización: "bg-purple-100 text-purple-800",
    }
    return colores[estado] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de tu tienda de letreros</p>
        </div>
        <Button asChild>
          <NavLinkViewTransition to={`/${slugTienda}/cotizaciones/nueva`}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cotización
          </NavLinkViewTransition>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.productos}</div>
            <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.cotizacionesPendientes}</div>
            <p className="text-xs text-muted-foreground">Pendientes de respuesta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Activas</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.ordenes}</div>
            <p className="text-xs text-muted-foreground">En diferentes etapas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.clientes}</div>
            <p className="text-xs text-muted-foreground">+12 este mes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metricas.ingresosMes.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +15% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.tiempoPromedio}</div>
            <p className="text-xs text-muted-foreground">De cotización a entrega</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.satisfaccion}/5</div>
            <p className="text-xs text-muted-foreground">Promedio de calificaciones</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Órdenes Recientes</CardTitle>
          <CardDescription>Últimas órdenes y su estado actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ordenesRecientes.map((orden) => (
              <div key={orden.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{orden.id}</p>
                  <p className="text-sm text-muted-foreground">{orden.cliente}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={obtenerColorEstado(orden.estado)}>{orden.estado}</Badge>
                  <p className="font-medium">${orden.valor}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" asChild className="w-full bg-transparent">
              <NavLinkViewTransition to={`/${slugTienda}/ordenes`}>Ver Todas las Órdenes</NavLinkViewTransition>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accesos directos a las funciones más utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" asChild className="h-20 flex-col bg-transparent">
              <NavLinkViewTransition to={`/${slugTienda}/productos/nuevo`}>
                <Package className="mb-2 h-6 w-6" />
                Agregar Producto
              </NavLinkViewTransition>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col bg-transparent">
              <NavLinkViewTransition to={`/${slugTienda}/clientes/nuevo`}>
                <Users className="mb-2 h-6 w-6" />
                Nuevo Cliente
              </NavLinkViewTransition>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col bg-transparent">
              <NavLinkViewTransition to={`/${slugTienda}/facturacion`}>
                <Receipt className="mb-2 h-6 w-6" />
                Ver Facturación
              </NavLinkViewTransition>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

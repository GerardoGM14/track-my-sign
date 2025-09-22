"use client"
import { Link, useParams } from "react-router-dom"
import { FileText, ClipboardList, Users, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"

export default function DashboardEmployee() {
  const { slugTienda } = useParams()

  const metricas = {
    cotizacionesAsignadas: 8,
    ordenesEnProceso: 5,
    clientesAtendidos: 23,
    tareasCompletadas: 12,
  }

  const tareasHoy = [
    { id: 1, titulo: "Revisar cotización REST-001", tipo: "cotización", prioridad: "alta" },
    { id: 2, titulo: "Contactar cliente Dental Sonrisa", tipo: "seguimiento", prioridad: "media" },
    { id: 3, titulo: "Actualizar orden ORD-002", tipo: "orden", prioridad: "alta" },
    { id: 4, titulo: "Preparar materiales para producción", tipo: "producción", prioridad: "baja" },
  ]

  const obtenerColorPrioridad = (prioridad) => {
    const colores = {
      alta: "bg-red-100 text-red-800",
      media: "bg-yellow-100 text-yellow-800",
      baja: "bg-green-100 text-green-800",
    }
    return colores[prioridad] || "bg-gray-100 text-gray-800"
  }

  const obtenerIconoTipo = (tipo) => {
    const iconos = {
      cotización: FileText,
      seguimiento: Users,
      orden: ClipboardList,
      producción: CheckCircle,
    }
    return iconos[tipo] || AlertCircle
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
          <p className="text-muted-foreground">Tus tareas y responsabilidades del día</p>
        </div>
        <Button asChild>
          <Link to={`/${slugTienda}/cotizaciones`}>Ver Cotizaciones</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.cotizacionesAsignadas}</div>
            <p className="text-xs text-muted-foreground">Asignadas a ti</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.ordenesEnProceso}</div>
            <p className="text-xs text-muted-foreground">En proceso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.clientesAtendidos}</div>
            <p className="text-xs text-muted-foreground">Atendidos este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.tareasCompletadas}</div>
            <p className="text-xs text-muted-foreground">Tareas esta semana</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tareas de Hoy</CardTitle>
          <CardDescription>Actividades programadas para completar hoy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tareasHoy.map((tarea) => {
              const IconoTipo = obtenerIconoTipo(tarea.tipo)
              return (
                <div key={tarea.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconoTipo className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{tarea.titulo}</p>
                      <p className="text-sm text-muted-foreground capitalize">{tarea.tipo}</p>
                    </div>
                  </div>
                  <Badge className={obtenerColorPrioridad(tarea.prioridad)}>{tarea.prioridad}</Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                <Link to={`/${slugTienda}/cotizaciones`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Mis Cotizaciones
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                <Link to={`/${slugTienda}/ordenes`}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Gestionar Órdenes
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                <Link to={`/${slugTienda}/clientes`}>
                  <Users className="mr-2 h-4 w-4" />
                  Contactar Clientes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recordatorios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Reunión de equipo a las 3:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>Cotización REST-001 vence mañana</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Orden ORD-003 lista para entrega</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

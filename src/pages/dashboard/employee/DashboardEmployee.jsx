"use client"
import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { FileText, ClipboardList, Users, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NavLinkViewTransition } from "@/components/layout/NavLinkViewTransition"
import { useContextoAuth } from "@/contexts/ContextoAuth"
import { useContextoTienda } from "@/contexts/ContextoTienda"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardEmployee() {
  const { slugTienda } = useParams()
  const { usuarioActual } = useContextoAuth()
  const { tiendaActual } = useContextoTienda()
  const [loading, setLoading] = useState(true)

  const [metricas, setMetricas] = useState({
    cotizacionesPendientes: 0,
    ordenesAsignadas: 0,
    clientesTotal: 0,
    ordenesCompletadas: 0,
  })

  const [tareasRecientes, setTareasRecientes] = useState([])

  useEffect(() => {
    if (tiendaActual && usuarioActual) {
      cargarDatos()
    }
  }, [tiendaActual, usuarioActual])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // 1. Cargar Cotizaciones (Pendientes en general)
      const qCotizaciones = query(
        collection(db, "tiendas", tiendaActual.id, "cotizaciones"),
        where("estado", "==", "pendiente")
      )
      const snapCotizaciones = await getDocs(qCotizaciones)

      // 2. Cargar Órdenes Asignadas al Empleado (En proceso)
      const qOrdenes = query(
        collection(db, "tiendas", tiendaActual.id, "ordenes"),
        where("employeeAssigned", "==", usuarioActual.uid),
        where("estado", "in", ["pendiente", "en_progreso", "revision"])
      )
      const snapOrdenes = await getDocs(qOrdenes)

      // 3. Cargar Órdenes Completadas por el Empleado (Histórico)
      const qOrdenesCompletas = query(
        collection(db, "tiendas", tiendaActual.id, "ordenes"),
        where("employeeAssigned", "==", usuarioActual.uid),
        where("estado", "==", "completado")
      )
      const snapOrdenesCompletas = await getDocs(qOrdenesCompletas)

      // 4. Clientes (Total tienda por ahora, o asignados si hubiera lógica)
      const qClientes = query(collection(db, "tiendas", tiendaActual.id, "clientes"))
      const snapClientes = await getDocs(qClientes)

      setMetricas({
        cotizacionesPendientes: snapCotizaciones.size,
        ordenesAsignadas: snapOrdenes.size,
        clientesTotal: snapClientes.size,
        ordenesCompletadas: snapOrdenesCompletas.size
      })

      // Construir lista de tareas basada en órdenes asignadas recientes
      const ordenesList = snapOrdenes.docs.map(doc => ({
        id: doc.id,
        titulo: `Orden #${doc.data().numero} - ${doc.data().cliente?.nombre || 'Cliente'}`,
        tipo: "orden",
        prioridad: doc.data().prioridad || "media",
        estado: doc.data().estado,
        fecha: doc.data().fechaCreacion
      }))

      setTareasRecientes(ordenesList.slice(0, 5))

    } catch (error) {
      console.error("Error cargando dashboard empleado:", error)
    } finally {
      setLoading(false)
    }
  }

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
      orden: ClipboardList,
      producción: CheckCircle,
    }
    return iconos[tipo] || AlertCircle
  }

  if (loading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hola, {usuarioActual?.nombre || 'Empleado'}</h1>
          <p className="text-muted-foreground">Aquí tienes el resumen de tu trabajo hoy.</p>
        </div>
        <Button asChild>
          <NavLinkViewTransition to={`/${slugTienda}/ordenes`}>Ver Mis Órdenes</NavLinkViewTransition>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cotizaciones Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.cotizacionesPendientes}</div>
            <p className="text-xs text-muted-foreground">En la tienda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Órdenes Activas</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.ordenesAsignadas}</div>
            <p className="text-xs text-muted-foreground">Asignadas a ti</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.clientesTotal}</div>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trabajo Completado</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.ordenesCompletadas}</div>
            <p className="text-xs text-muted-foreground">Órdenes finalizadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Mis Tareas Prioritarias</CardTitle>
            <CardDescription>
              Órdenes asignadas que requieren tu atención inmediata.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tareasRecientes.length > 0 ? (
                tareasRecientes.map((tarea) => {
                  const Icono = obtenerIconoTipo(tarea.tipo)
                  return (
                    <Link
                      key={tarea.id}
                      to={tarea.tipo === 'orden' ? `/${slugTienda}/ordenes/${tarea.id}` : '#'}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full bg-primary/10 text-primary`}>
                          <Icono className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium leading-none group-hover:text-primary transition-colors">{tarea.titulo}</p>
                          <p className="text-sm text-muted-foreground mt-1 capitalize">Estado: {tarea.estado?.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={obtenerColorPrioridad(tarea.prioridad)}>
                          {tarea.prioridad}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No tienes órdenes asignadas pendientes. ¡Buen trabajo!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>Atajos a tus herramientas más usadas</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to={`/${slugTienda}/ordenes`}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Gestionar Órdenes
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to={`/${slugTienda}/cotizaciones`}>
                <FileText className="mr-2 h-4 w-4" />
                Ver Cotizaciones
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to={`/${slugTienda}/clientes`}>
                <Users className="mr-2 h-4 w-4" />
                Directorio de Clientes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


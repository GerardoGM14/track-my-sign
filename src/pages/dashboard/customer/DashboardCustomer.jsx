"use client"
import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { FileText, Clock, CheckCircle, Eye, Download, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NavLinkViewTransition } from "@/components/layout/NavLinkViewTransition"
import { useContextoAuth } from "@/contexts/ContextoAuth"
import { useContextoTienda } from "@/contexts/ContextoTienda"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardCustomer() {
  const { slugTienda } = useParams()
  const { usuarioActual } = useContextoAuth()
  const { tiendaActual } = useContextoTienda()
  const [loading, setLoading] = useState(true)
  
  const [misCotizaciones, setMisCotizaciones] = useState([])
  const [misOrdenes, setMisOrdenes] = useState([])

  useEffect(() => {
    if (tiendaActual && usuarioActual) {
      cargarDatos()
    }
  }, [tiendaActual, usuarioActual])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      // Intentar buscar por email, que es lo más seguro que tenemos en el auth actual
      const emailCliente = usuarioActual.email

      if (!emailCliente) {
        setLoading(false)
        return
      }

      // 1. Cargar Cotizaciones del Cliente
      // Nota: Asumimos que la cotización guarda el email del cliente en cliente.email
      // Si la estructura es diferente, habrá que ajustar.
      const qCotizaciones = query(
        collection(db, "tiendas", tiendaActual.id, "cotizaciones"),
        where("cliente.email", "==", emailCliente),
        orderBy("fechaCreacion", "desc"),
        limit(5)
      )
      const snapCotizaciones = await getDocs(qCotizaciones)
      const cotizacionesData = snapCotizaciones.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Normalizar fecha para mostrar
        fecha: doc.data().fechaCreacion?.seconds ? new Date(doc.data().fechaCreacion.seconds * 1000).toLocaleDateString() : "Fecha desconocida"
      }))
      setMisCotizaciones(cotizacionesData)
      
      // 2. Cargar Órdenes del Cliente
      const qOrdenes = query(
        collection(db, "tiendas", tiendaActual.id, "ordenes"),
        where("cliente.email", "==", emailCliente),
        orderBy("fechaCreacion", "desc"),
        limit(5)
      )
      const snapOrdenes = await getDocs(qOrdenes)
      const ordenesData = snapOrdenes.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        progreso: calcularProgreso(doc.data().estado),
        fechaEntrega: doc.data().fechaEntrega?.seconds ? new Date(doc.data().fechaEntrega.seconds * 1000).toLocaleDateString() : "Pendiente"
      }))
      setMisOrdenes(ordenesData)

    } catch (error) {
      console.error("Error cargando dashboard cliente:", error)
      // Si falla por índice inexistente (muy probable al ordenar), intentar sin orderby
      if (error.code === 'failed-precondition') {
         console.log("Reintentando sin ordenamiento (falta índice)...")
         // Fallback simple si no hay índices
      }
    } finally {
      setLoading(false)
    }
  }

  const calcularProgreso = (estado) => {
    const estados = {
      'pendiente': 10,
      'en_progreso': 40,
      'revision': 80,
      'completado': 100
    }
    return estados[estado] || 0
  }

  const obtenerColorEstado = (estado) => {
    const colores = {
      aprobada: "bg-green-100 text-green-800",
      pendiente: "bg-yellow-100 text-yellow-800",
      rechazada: "bg-red-100 text-red-800",
      borrador: "bg-gray-100 text-gray-800",
    }
    return colores[estado?.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>
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
            <p className="text-xs text-muted-foreground">Solicitudes recientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{misOrdenes.filter(o => o.estado !== 'completado').length}</div>
            <p className="text-xs text-muted-foreground">Proyectos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{misOrdenes.filter(o => o.estado === 'completado').length}</div>
            <p className="text-xs text-muted-foreground">Proyectos finalizados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Últimas Cotizaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Cotizaciones</CardTitle>
            <CardDescription>Estado de tus solicitudes recientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {misCotizaciones.length > 0 ? (
                misCotizaciones.map((cot) => (
                  <div key={cot.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">Cotización #{cot.numero}</p>
                      <p className="text-xs text-muted-foreground">{cot.fecha}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">€{cot.totales?.total || 0}</span>
                        <Badge className={obtenerColorEstado(cot.estado)}>{cot.estado}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No hay cotizaciones recientes.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Órdenes Activas */}
        <Card>
          <CardHeader>
            <CardTitle>Órdenes en Curso</CardTitle>
            <CardDescription>Seguimiento de producción</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {misOrdenes.filter(o => o.estado !== 'completado').length > 0 ? (
                misOrdenes.filter(o => o.estado !== 'completado').map((orden) => (
                  <div key={orden.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">Orden #{orden.numero}</p>
                      <span className="text-xs text-muted-foreground">Entrega: {orden.fechaEntrega}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${orden.progreso}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{orden.estado?.replace('_', ' ')}</span>
                      <span>{orden.progreso}%</span>
                    </div>
                    <div className="pt-2">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link to={`/${slugTienda}/ordenes/${orden.id}`}>
                                <Eye className="mr-2 h-3 w-3" />
                                Ver Detalles
                            </Link>
                        </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No tienes órdenes activas en este momento.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


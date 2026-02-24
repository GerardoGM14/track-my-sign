"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useContextoTienda } from "@/contexts/ContextoTienda"
import { useContextoAuth } from "@/contexts/ContextoAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  MessageSquare, 
  Paperclip, 
  Clock, 
  Send, 
  CheckCircle,
  AlertCircle,
  Download,
  Trash2
} from "lucide-react"
import { toast } from "@/hooks/user-toast"
import { PDFDownloadLink } from "@react-pdf/renderer"
import DocumentoOrden from "@/components/pdf/DocumentoOrden"

export default function PaginaDetalleOrden() {
  const { slugTienda, id } = useParams()
  const navigate = useNavigate()
  const { tiendaActual } = useContextoTienda()
  const { usuarioActual } = useContextoAuth()
  
  const [orden, setOrden] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("info")
  
  // Normalizar rol
  const esCliente = usuarioActual?.rol === "customer" || usuarioActual?.rol === "cliente"

  useEffect(() => {
    if (orden && esCliente && usuarioActual?.email) {
        // Verificar propiedad
        if (orden.cliente?.email && orden.cliente.email !== usuarioActual.email) {
            toast({
                title: "Acceso denegado",
                description: "No tienes permiso para ver esta orden",
                variant: "destructive"
            })
            navigate(`/${slugTienda || tiendaActual?.slug}`)
        }
    }
  }, [orden, esCliente, usuarioActual, slugTienda, tiendaActual, navigate])

  // Chat state
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const scrollRef = useRef(null)
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  // Archivos state (simulado por ahora, o metadata en firestore)
  const [archivos, setArchivos] = useState([])

  useEffect(() => {
    if (tiendaActual && id) {
      const unsubscribe = cargarOrden()
      return () => unsubscribe && unsubscribe()
    }
  }, [tiendaActual, id])

  const cargarOrden = () => {
    setLoading(true)
    const ordenRef = doc(db, "tiendas", tiendaActual.id, "ordenes", id)
    
    // Suscripción en tiempo real a la orden
    const unsubscribeOrden = onSnapshot(ordenRef, (docSnap) => {
      if (docSnap.exists()) {
        setOrden({ id: docSnap.id, ...docSnap.data() })
        setLoading(false)
      } else {
        toast({
          title: "Error",
          description: "La orden no existe",
          variant: "destructive"
        })
        navigate(-1)
      }
    })

    // Suscripción a mensajes
    const mensajesRef = collection(db, "tiendas", tiendaActual.id, "ordenes", id, "mensajes")
    const qMensajes = query(mensajesRef, orderBy("fecha", "asc"))
    const unsubscribeMensajes = onSnapshot(qMensajes, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMensajes(msgs)
      if (scrollRef.current) {
        setTimeout(() => scrollRef.current.scrollIntoView({ behavior: "smooth" }), 100)
      }
    })

    // Suscripción a archivos (si existiera subcolección, por ahora usaremos array en doc o subcolección)
    // Para simplificar, asumiremos una subcolección 'archivos'
    const archivosRef = collection(db, "tiendas", tiendaActual.id, "ordenes", id, "archivos")
    const qArchivos = query(archivosRef, orderBy("fecha", "desc"))
    const unsubscribeArchivos = onSnapshot(qArchivos, (snapshot) => {
        const files = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setArchivos(files)
    })

    return () => {
      unsubscribeOrden()
      unsubscribeMensajes()
      unsubscribeArchivos()
    }
  }

  const enviarMensaje = async (e) => {
    e.preventDefault()
    if (!nuevoMensaje.trim()) return

    try {
      const mensajesRef = collection(db, "tiendas", tiendaActual.id, "ordenes", id, "mensajes")
      await addDoc(mensajesRef, {
        texto: nuevoMensaje,
        usuarioId: usuarioActual.uid,
        usuarioNombre: usuarioActual.nombre || usuarioActual.email,
        fecha: serverTimestamp(),
        esSistema: false
      })
      setNuevoMensaje("")
    } catch (error) {
      console.error("Error enviando mensaje:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      })
    }
  }

  const subirArchivo = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
        setUploading(true)
        // Referencia a Storage: tiendas/{tiendaId}/ordenes/{ordenId}/{fileName}
        const storageRef = ref(storage, `tiendas/${tiendaActual.id}/ordenes/${id}/${file.name}`)
        
        // Subir archivo
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)

        // Guardar metadata en Firestore
        const archivosRef = collection(db, "tiendas", tiendaActual.id, "ordenes", id, "archivos")
        await addDoc(archivosRef, {
            nombre: file.name,
            url: url,
            tipo: file.type,
            usuarioNombre: usuarioActual.nombre || "Usuario",
            fecha: serverTimestamp()
        })
        
        toast({ title: "Archivo subido exitosamente" })
    } catch (error) {
        console.error("Error subiendo archivo:", error)
        toast({ 
            title: "Error al subir archivo", 
            description: "Hubo un problema al subir el archivo. Intenta de nuevo.",
            variant: "destructive" 
        })
    } finally {
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const obtenerColorEstado = (estado) => {
    const colores = {
      pendiente: "bg-gray-100 text-gray-800",
      en_progreso: "bg-blue-100 text-blue-800",
      revision: "bg-yellow-100 text-yellow-800",
      completado: "bg-green-100 text-green-800",
    }
    return colores[estado] || "bg-gray-100 text-gray-800"
  }

  if (loading || !orden) {
    return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Orden #{orden.numero}</h1>
              <Badge className={obtenerColorEstado(orden.estado)}>{orden.estado?.replace('_', ' ')}</Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <User className="h-3 w-3" /> {orden.cliente?.nombre || "Cliente General"} 
              <span className="mx-1">•</span>
              <Calendar className="h-3 w-3" /> Entrega: {orden.fechaEntrega?.seconds ? new Date(orden.fechaEntrega.seconds * 1000).toLocaleDateString() : "Pendiente"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            {/* Acciones globales como Cambiar Estado, Editar, etc. */}
            {!esCliente && <Button variant="outline">Editar Orden</Button>}
            
            {orden && (
              <PDFDownloadLink
                document={<DocumentoOrden orden={orden} tienda={tiendaActual} />}
                fileName={`orden_${orden.numero || 'sin_numero'}.pdf`}
              >
                {({ blob, url, loading, error }) => (
                  <Button disabled={loading} variant="default">
                    {loading ? "Generando..." : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                      </>
                    )}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="archivos">Archivos ({archivos.length})</TabsTrigger>
          <TabsTrigger value="chat">Chat y Notas</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto mt-4 pr-2">
            {/* Pestaña Información */}
            <TabsContent value="info" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Detalles Principales */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Items de la Orden</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {orden.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-base">{item.nombreProducto}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{item.descripcion}</p>
                                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                <span>Cant: {item.cantidad}</span>
                                                {item.ancho && <span>Medidas: {item.ancho}x{item.alto}cm</span>}
                                            </div>
                                        </div>
                                        <p className="font-semibold">€{item.precioCalculado}</p>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-4" />
                            <div className="flex justify-end text-right">
                                <div className="space-y-1">
                                    <div className="flex justify-between gap-8 text-sm">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span>€{orden.totales?.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between gap-8 text-sm">
                                        <span className="text-muted-foreground">Impuestos:</span>
                                        <span>€{orden.totales?.impuestos}</span>
                                    </div>
                                    <div className="flex justify-between gap-8 font-bold text-lg mt-2">
                                        <span>Total:</span>
                                        <span>€{orden.totales?.total}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Datos del Cliente</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{orden.cliente?.nombre}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground ml-6">{orden.cliente?.email}</span>
                                </div>
                                {orden.cliente?.telefono && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground ml-6">{orden.cliente?.telefono}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {!esCliente && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Asignación</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {orden.employeeAssigned ? "Asignado a: (ID " + orden.employeeAssigned + ")" : "Sin asignar"}
                                </p>
                            </CardContent>
                        </Card>
                        )}
                    </div>
                </div>
            </TabsContent>

            {/* Pestaña Archivos */}
            <TabsContent value="archivos" className="h-full">
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Archivos Adjuntos</CardTitle>
                            <CardDescription>Planos, diseños y comprobantes de la orden.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={subirArchivo}
                            />
                            <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                <Paperclip className="h-4 w-4 mr-2" />
                                {uploading ? "Subiendo..." : "Subir Archivo"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {archivos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-lg">
                                <FileText className="h-8 w-8 mb-2 opacity-50" />
                                <p>No hay archivos adjuntos</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {archivos.map((archivo) => (
                                    <div key={archivo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-blue-100 p-2 rounded">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="truncate">
                                                <p className="font-medium text-sm truncate" title={archivo.nombre}>{archivo.nombre}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {archivo.fecha?.seconds ? new Date(archivo.fecha.seconds * 1000).toLocaleDateString() : "Reciente"} • {archivo.usuarioNombre}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" asChild>
                                            <a href={archivo.url} target="_blank" rel="noopener noreferrer" download>
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Pestaña Chat */}
            <TabsContent value="chat" className="h-[600px]">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Comentarios y Actividad</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-4">
                                {mensajes.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8">No hay mensajes aún. Inicia la conversación.</p>
                                )}
                                {mensajes.map((msg) => (
                                    <div key={msg.id} className={`flex gap-3 ${msg.usuarioId === usuarioActual.uid ? 'flex-row-reverse' : ''}`}>
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{msg.usuarioNombre?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className={`flex flex-col max-w-[80%] ${msg.usuarioId === usuarioActual.uid ? 'items-end' : ''}`}>
                                            <div className={`p-3 rounded-lg text-sm ${msg.usuarioId === usuarioActual.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                {msg.texto}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground mt-1">
                                                {msg.fecha?.seconds ? new Date(msg.fecha.seconds * 1000).toLocaleString() : 'Enviando...'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                        <div className="pt-4 border-t">
                            <form onSubmit={enviarMensaje} className="flex gap-2">
                                <Input 
                                    placeholder="Escribe un comentario..." 
                                    value={nuevoMensaje}
                                    onChange={(e) => setNuevoMensaje(e.target.value)}
                                />
                                <Button type="submit" size="icon" disabled={!nuevoMensaje.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Pestaña Historial */}
            <TabsContent value="historial">
                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Cambios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orden.historialEstados && orden.historialEstados.length > 0 ? (
                                orden.historialEstados.slice().reverse().map((evento, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="mt-1">
                                            <CheckCircle className={`h-5 w-5 ${evento.estado === 'completado' ? 'text-green-500' : 'text-blue-500'}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {evento.estado === 'pendiente' && idx === orden.historialEstados.length - 1 
                                                    ? 'Orden Creada' 
                                                    : `Cambio a estado: ${evento.estado.replace('_', ' ')}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {evento.fecha?.seconds ? new Date(evento.fecha.seconds * 1000).toLocaleString() : "Fecha desconocida"}
                                                {evento.usuario && ` • por ${evento.usuario}`}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Orden Creada</p>
                                        <p className="text-xs text-muted-foreground">
                                            {orden.fechaCreacion?.seconds ? new Date(orden.fechaCreacion.seconds * 1000).toLocaleString() : "Fecha desconocida"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

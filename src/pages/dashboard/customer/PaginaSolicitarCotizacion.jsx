"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useContextoTienda } from "@/contexts/ContextoTienda"
import { useContextoAuth } from "@/contexts/ContextoAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FileText, Upload, Calendar, Send, ArrowLeft, X } from "lucide-react"
import { toast } from "@/hooks/user-toast";

export default function PaginaSolicitarCotizacion() {
  const { slugTienda } = useParams()
  const navigate = useNavigate()
  const { tiendaActual } = useContextoTienda()
  const { usuarioActual } = useContextoAuth()

  const [loading, setLoading] = useState(false)
  const [archivos, setArchivos] = useState([])
  const [formData, setFormData] = useState({
    proyecto: "",
    descripcion: "",
    fechaDeseada: "",
  })

  const manejarCambio = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const manejarArchivos = (e) => {
    const files = Array.from(e.target.files)
    setArchivos((prev) => [...prev, ...files])
  }

  const removerArchivo = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index))
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()
    
    if (!formData.proyecto || !formData.descripcion) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el título y la descripción del proyecto.",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)

      // 1. Subir archivos si existen
      const archivosSubidos = []
      if (archivos.length > 0) {
        for (const archivo of archivos) {
          const storageRef = ref(storage, `tiendas/${tiendaActual.id}/cotizaciones_solicitudes/${Date.now()}_${archivo.name}`)
          await uploadBytes(storageRef, archivo)
          const url = await getDownloadURL(storageRef)
          archivosSubidos.push({
            nombre: archivo.name,
            url: url,
            tipo: archivo.type
          })
        }
      }

      // 2. Crear documento de cotización
      // Estado inicial: 'pendiente' (solicitud)
      const nuevaCotizacion = {
        numero: `SOL-${Date.now().toString().slice(-6)}`, // Número temporal
        proyecto: formData.proyecto,
        descripcion: formData.descripcion,
        fechaDeseada: formData.fechaDeseada ? new Date(formData.fechaDeseada) : null,
        cliente: {
          uid: usuarioActual.uid,
          nombre: usuarioActual.nombre || usuarioActual.email,
          email: usuarioActual.email,
          telefono: usuarioActual.telefono || ""
        },
        estado: "pendiente", // Pendiente de revisión por la tienda
        fechaCreacion: serverTimestamp(),
        archivos: archivosSubidos,
        origen: "portal_cliente",
        items: [], // Se llenarán por la tienda
        totales: { total: 0 }
      }

      await addDoc(collection(db, "tiendas", tiendaActual.id, "cotizaciones"), nuevaCotizacion)

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de cotización ha sido enviada correctamente. Te notificaremos cuando esté lista."
      })

      navigate(`/${slugTienda}`)

    } catch (error) {
      console.error("Error enviando solicitud:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu solicitud. Intenta de nuevo.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Solicitar Cotización</h1>
          <p className="text-muted-foreground">Cuéntanos sobre tu proyecto y te enviaremos un presupuesto personalizado.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Proyecto</CardTitle>
          <CardDescription>Proporciona toda la información posible para una cotización precisa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarEnvio} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="proyecto">Nombre del Proyecto *</Label>
              <Input
                id="proyecto"
                name="proyecto"
                placeholder="Ej: Rótulo luminoso para fachada"
                value={formData.proyecto}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción Detallada *</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                placeholder="Describe materiales, medidas aproximadas, ubicación, colores, etc."
                className="min-h-[150px]"
                value={formData.descripcion}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaDeseada">Fecha Deseada de Entrega (Opcional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fechaDeseada"
                  name="fechaDeseada"
                  type="date"
                  className="pl-9"
                  value={formData.fechaDeseada}
                  onChange={manejarCambio}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Archivos de Referencia (Logos, diseños, fotos del lugar)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={manejarArchivos}
                  accept="image/*,.pdf,.ai,.eps,.svg"
                />
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Arrastra archivos o haz clic para subir</p>
                <p className="text-xs text-muted-foreground mt-1">Imágenes, PDF, AI, EPS (Máx. 10MB)</p>
              </div>
              
              {archivos.length > 0 && (
                <div className="grid gap-2 mt-4">
                  {archivos.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded bg-muted/20">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removerArchivo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" /> Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Enviar Solicitud
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

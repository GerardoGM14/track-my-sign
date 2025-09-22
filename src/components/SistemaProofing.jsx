"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { useContextoAuth } from "../contexts/ContextoAuth"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Upload, FileText, Send, Eye, CheckCircle, XCircle, Clock } from "lucide-react"

export function SistemaProofing() {
  const { tiendaActual } = useContextoTienda()
  const { usuarioActual } = useContextoAuth()
  const [pruebas, setPruebas] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [nuevaPrueba, setNuevaPrueba] = useState({
    ordenId: "",
    numeroOrden: "",
    clienteEmail: "",
    clienteNombre: "",
    descripcion: "",
    archivos: [],
    estado: "pendiente_aprobacion",
    notas: "",
  })

  useEffect(() => {
    if (tiendaActual) {
      cargarDatos()
    }
  }, [tiendaActual])

  const cargarDatos = async () => {
    try {
      setCargando(true)

      // Cargar pruebas
      const pruebasRef = collection(db, "tiendas", tiendaActual.id, "pruebas")
      const pruebasSnapshot = await getDocs(pruebasRef)
      const pruebasData = pruebasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPruebas(pruebasData)

      // Cargar órdenes en progreso
      const ordenesRef = collection(db, "tiendas", tiendaActual.id, "ordenes")
      const ordenesQuery = query(ordenesRef, where("estado", "in", ["en_progreso", "revision"]))
      const ordenesSnapshot = await getDocs(ordenesQuery)
      const ordenesData = ordenesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setOrdenes(ordenesData)
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setCargando(false)
    }
  }

  const generarNumeroPrueba = () => {
    const fecha = new Date()
    const año = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, "0")
    const contador = pruebas.length + 1
    return `PRU-${año}${mes}-${String(contador).padStart(3, "0")}`
  }

  const crearPrueba = async (e) => {
    e.preventDefault()
    try {
      setCargando(true)
      const orden = ordenes.find((o) => o.id === nuevaPrueba.ordenId)

      const pruebaData = {
        ...nuevaPrueba,
        numero: generarNumeroPrueba(),
        numeroOrden: orden.numero,
        clienteEmail: orden.cliente.email,
        clienteNombre: orden.cliente.nombre,
        fechaCreacion: new Date(),
        creadoPor: usuarioActual.nombre,
      }

      const pruebasRef = collection(db, "tiendas", tiendaActual.id, "pruebas")
      await addDoc(pruebasRef, pruebaData)

      // Actualizar estado de la orden
      await updateDoc(doc(db, "tiendas", tiendaActual.id, "ordenes", nuevaPrueba.ordenId), {
        estado: "revision",
        fechaActualizacion: new Date(),
      })

      await cargarDatos()
      resetearFormulario()
    } catch (error) {
      console.error("Error creando prueba:", error)
    } finally {
      setCargando(false)
    }
  }

  const resetearFormulario = () => {
    setNuevaPrueba({
      ordenId: "",
      numeroOrden: "",
      clienteEmail: "",
      clienteNombre: "",
      descripcion: "",
      archivos: [],
      estado: "pendiente_aprobacion",
      notas: "",
    })
    setMostrarFormulario(false)
  }

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case "pendiente_aprobacion":
        return "bg-orange-100 text-orange-800"
      case "aprobada":
        return "bg-green-100 text-green-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case "pendiente_aprobacion":
        return <Clock className="w-4 h-4" />
      case "aprobada":
        return <CheckCircle className="w-4 h-4" />
      case "rechazada":
        return <XCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sistema de Pruebas</h1>
        <Button onClick={() => setMostrarFormulario(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Nueva Prueba
        </Button>
      </div>

      {mostrarFormulario && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Crear Nueva Prueba</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={crearPrueba} className="space-y-4">
              <div>
                <Label>Orden</Label>
                <Select
                  value={nuevaPrueba.ordenId}
                  onValueChange={(value) => setNuevaPrueba({ ...nuevaPrueba, ordenId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar orden" />
                  </SelectTrigger>
                  <SelectContent>
                    {ordenes.map((orden) => (
                      <SelectItem key={orden.id} value={orden.id}>
                        {orden.numero} - {orden.cliente.nombre} (€{orden.totales?.total})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Descripción de la Prueba</Label>
                <Textarea
                  value={nuevaPrueba.descripcion}
                  onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, descripcion: e.target.value })}
                  placeholder="Describe qué está enviando para aprobación..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label>Archivos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Arrastra archivos aquí o haz clic para seleccionar</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG hasta 10MB cada uno</p>
                  <Input type="file" multiple className="mt-2" accept=".pdf,.jpg,.jpeg,.png" />
                </div>
              </div>

              <div>
                <Label>Notas Internas</Label>
                <Textarea
                  value={nuevaPrueba.notas}
                  onChange={(e) => setNuevaPrueba({ ...nuevaPrueba, notas: e.target.value })}
                  placeholder="Notas para el equipo interno..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={cargando || !nuevaPrueba.ordenId || !nuevaPrueba.descripcion}>
                  {cargando ? "Creando..." : "Crear Prueba"}
                </Button>
                <Button type="button" variant="outline" onClick={resetearFormulario}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de pruebas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pruebas.map((prueba) => (
          <Card key={prueba.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {obtenerIconoEstado(prueba.estado)}
                    {prueba.numero}
                  </CardTitle>
                  <p className="text-sm text-gray-600">Orden: {prueba.numeroOrden}</p>
                  <p className="text-sm text-gray-600">Cliente: {prueba.clienteNombre}</p>
                </div>
                <Badge className={obtenerColorEstado(prueba.estado)}>{prueba.estado}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">{prueba.descripcion}</p>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Creada: {new Date(prueba.fechaCreacion?.seconds * 1000).toLocaleDateString()}</span>
                  <span>Por: {prueba.creadoPor}</span>
                </div>

                {prueba.archivos && prueba.archivos.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{prueba.archivos.length} archivo(s)</span>
                  </div>
                )}

                {prueba.comentariosCliente && (
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <p className="text-xs font-medium text-blue-800">Comentarios del cliente:</p>
                    <p className="text-sm text-blue-700">{prueba.comentariosCliente}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  {prueba.estado === "rechazada" && (
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Send className="w-4 h-4 mr-1" />
                      Reenviar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pruebas.length === 0 && !cargando && (
        <div className="text-center py-8">
          <Upload className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No hay pruebas registradas</p>
          <p className="text-gray-400">Crea la primera prueba para enviar al cliente</p>
          <Button className="mt-4" onClick={() => setMostrarFormulario(true)}>
            Crear Primera Prueba
          </Button>
        </div>
      )}
    </div>
  )
}

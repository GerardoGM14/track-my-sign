"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Plus, Trash2, FileText, Send } from "lucide-react"

export function PaginaCotizaciones() {
  const { tiendaActual } = useContextoTienda()
  const [cotizaciones, setCotizaciones] = useState([])
  const [productos, setProductos] = useState([])
  const [reglasPrecio, setReglasPrecio] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cotizacionEditando, setCotizacionEditando] = useState(null)
  const [cargando, setCargando] = useState(false)

  const [formulario, setFormulario] = useState({
    numero: "",
    cliente: {
      nombre: "",
      email: "",
      telefono: "",
      empresa: "",
      direccion: "",
    },
    items: [],
    descuentoGlobal: 0,
    impuestos: 21,
    notas: "",
    validezDias: 30,
    estado: "borrador",
  })

  const [nuevoItem, setNuevoItem] = useState({
    productoId: "",
    descripcion: "",
    cantidad: 1,
    ancho: 0,
    alto: 0,
    material: "",
    acabado: "",
    precioUnitario: 0,
    descuento: 0,
  })

  useEffect(() => {
    if (tiendaActual) {
      cargarDatos()
    }
  }, [tiendaActual])

  const cargarDatos = async () => {
    try {
      setCargando(true)

      // Cargar cotizaciones
      const cotizacionesRef = collection(db, "tiendas", tiendaActual.id, "cotizaciones")
      const cotizacionesSnapshot = await getDocs(cotizacionesRef)
      const cotizacionesData = cotizacionesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setCotizaciones(cotizacionesData)

      // Cargar productos
      const productosRef = collection(db, "tiendas", tiendaActual.id, "productos")
      const productosSnapshot = await getDocs(productosRef)
      const productosData = productosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setProductos(productosData)

      // Cargar reglas de precio
      const reglasRef = collection(db, "tiendas", tiendaActual.id, "reglasPrecio")
      const reglasSnapshot = await getDocs(reglasRef)
      const reglasData = reglasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setReglasPrecio(reglasData)
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setCargando(false)
    }
  }

  const generarNumeroCotizacion = () => {
    const fecha = new Date()
    const año = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, "0")
    const contador = cotizaciones.length + 1
    return `COT-${año}${mes}-${String(contador).padStart(3, "0")}`
  }

  const calcularPrecioItem = (item) => {
    const producto = productos.find((p) => p.id === item.productoId)
    if (!producto) return 0

    let precioBase = producto.precioBase
    let superficie = 0

    // Calcular superficie si es necesario
    if (producto.unidadMedida === "m²" && item.ancho && item.alto) {
      superficie = (item.ancho / 100) * (item.alto / 100) // convertir cm a m²
      precioBase = precioBase * superficie
    }

    // Aplicar reglas de precio
    const reglasAplicables = reglasPrecio.filter(
      (regla) => regla.activa && (regla.productoId === "" || regla.productoId === item.productoId),
    )

    reglasAplicables.forEach((regla) => {
      let aplicarRegla = false

      switch (regla.tipoRegla) {
        case "cantidad":
          if (regla.condicion === "mayor_que" && item.cantidad > regla.valor1) aplicarRegla = true
          if (regla.condicion === "menor_que" && item.cantidad < regla.valor1) aplicarRegla = true
          if (regla.condicion === "igual_a" && item.cantidad === regla.valor1) aplicarRegla = true
          if (regla.condicion === "entre" && item.cantidad >= regla.valor1 && item.cantidad <= regla.valor2)
            aplicarRegla = true
          break
        case "superficie":
          if (regla.condicion === "mayor_que" && superficie > regla.valor1) aplicarRegla = true
          if (regla.condicion === "menor_que" && superficie < regla.valor1) aplicarRegla = true
          break
      }

      if (aplicarRegla) {
        if (regla.tipoDescuento === "porcentaje") {
          precioBase = precioBase * (1 - regla.descuento / 100)
        } else {
          precioBase = precioBase - regla.descuento
        }
      }
    })

    // Aplicar descuento del item
    if (item.descuento > 0) {
      precioBase = precioBase * (1 - item.descuento / 100)
    }

    return Math.max(0, precioBase * item.cantidad)
  }

  const agregarItem = () => {
    if (!nuevoItem.productoId) return

    const producto = productos.find((p) => p.id === nuevoItem.productoId)
    const itemConPrecio = {
      ...nuevoItem,
      id: Date.now(),
      nombreProducto: producto.nombre,
      precioCalculado: calcularPrecioItem(nuevoItem),
    }

    setFormulario((prev) => ({
      ...prev,
      items: [...prev.items, itemConPrecio],
    }))

    setNuevoItem({
      productoId: "",
      descripcion: "",
      cantidad: 1,
      ancho: 0,
      alto: 0,
      material: "",
      acabado: "",
      precioUnitario: 0,
      descuento: 0,
    })
  }

  const eliminarItem = (itemId) => {
    setFormulario((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
  }

  const calcularTotales = () => {
    const subtotal = formulario.items.reduce((sum, item) => sum + calcularPrecioItem(item), 0)
    const descuentoGlobal = subtotal * (formulario.descuentoGlobal / 100)
    const baseImponible = subtotal - descuentoGlobal
    const impuestos = baseImponible * (formulario.impuestos / 100)
    const total = baseImponible + impuestos

    return {
      subtotal: subtotal.toFixed(2),
      descuentoGlobal: descuentoGlobal.toFixed(2),
      baseImponible: baseImponible.toFixed(2),
      impuestos: impuestos.toFixed(2),
      total: total.toFixed(2),
    }
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()
    try {
      setCargando(true)
      const cotizacionesRef = collection(db, "tiendas", tiendaActual.id, "cotizaciones")

      const totales = calcularTotales()
      const datosCotizacion = {
        ...formulario,
        numero: formulario.numero || generarNumeroCotizacion(),
        totales,
        fechaCreacion: new Date(),
        fechaVencimiento: new Date(Date.now() + formulario.validezDias * 24 * 60 * 60 * 1000),
      }

      if (cotizacionEditando) {
        await updateDoc(doc(db, "tiendas", tiendaActual.id, "cotizaciones", cotizacionEditando.id), datosCotizacion)
      } else {
        await addDoc(cotizacionesRef, datosCotizacion)
      }

      await cargarDatos()
      resetearFormulario()
    } catch (error) {
      console.error("Error guardando cotización:", error)
    } finally {
      setCargando(false)
    }
  }

  const cambiarEstadoCotizacion = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, "tiendas", tiendaActual.id, "cotizaciones", id), {
        estado: nuevoEstado,
        fechaActualizacion: new Date(),
      })
      await cargarDatos()
    } catch (error) {
      console.error("Error actualizando estado:", error)
    }
  }

  const eliminarCotizacion = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta cotización?")) {
      try {
        await deleteDoc(doc(db, "tiendas", tiendaActual.id, "cotizaciones", id))
        await cargarDatos()
      } catch (error) {
        console.error("Error eliminando cotización:", error)
      }
    }
  }

  const resetearFormulario = () => {
    setFormulario({
      numero: "",
      cliente: {
        nombre: "",
        email: "",
        telefono: "",
        empresa: "",
        direccion: "",
      },
      items: [],
      descuentoGlobal: 0,
      impuestos: 21,
      notas: "",
      validezDias: 30,
      estado: "borrador",
    })
    setCotizacionEditando(null)
    setMostrarFormulario(false)
  }

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case "borrador":
        return "bg-gray-100 text-gray-800"
      case "enviada":
        return "bg-blue-100 text-blue-800"
      case "aprobada":
        return "bg-green-100 text-green-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      case "vencida":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cotizaciones</h1>
        <Button onClick={() => setMostrarFormulario(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cotización
        </Button>
      </div>

      {mostrarFormulario && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{cotizacionEditando ? "Editar Cotización" : "Nueva Cotización"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={manejarSubmit} className="space-y-6">
              {/* Información del cliente */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombreCliente">Nombre del Cliente</Label>
                    <Input
                      id="nombreCliente"
                      value={formulario.cliente.nombre}
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          cliente: { ...formulario.cliente, nombre: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailCliente">Email</Label>
                    <Input
                      id="emailCliente"
                      type="email"
                      value={formulario.cliente.email}
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          cliente: { ...formulario.cliente, email: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefonoCliente">Teléfono</Label>
                    <Input
                      id="telefonoCliente"
                      value={formulario.cliente.telefono}
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          cliente: { ...formulario.cliente, telefono: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="empresaCliente">Empresa</Label>
                    <Input
                      id="empresaCliente"
                      value={formulario.cliente.empresa}
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          cliente: { ...formulario.cliente, empresa: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Agregar items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Agregar Producto</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Producto</Label>
                    <Select
                      value={nuevoItem.productoId}
                      onValueChange={(value) => setNuevoItem({ ...nuevoItem, productoId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {productos.map((producto) => (
                          <SelectItem key={producto.id} value={producto.id}>
                            {producto.nombre} - €{producto.precioBase}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      value={nuevoItem.cantidad}
                      onChange={(e) => setNuevoItem({ ...nuevoItem, cantidad: Number.parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Ancho (cm)</Label>
                    <Input
                      type="number"
                      value={nuevoItem.ancho}
                      onChange={(e) => setNuevoItem({ ...nuevoItem, ancho: Number.parseFloat(e.target.value) })}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Alto (cm)</Label>
                    <Input
                      type="number"
                      value={nuevoItem.alto}
                      onChange={(e) => setNuevoItem({ ...nuevoItem, alto: Number.parseFloat(e.target.value) })}
                      step="0.1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Descripción</Label>
                    <Input
                      value={nuevoItem.descripcion}
                      onChange={(e) => setNuevoItem({ ...nuevoItem, descripcion: e.target.value })}
                      placeholder="Descripción adicional"
                    />
                  </div>
                  <div>
                    <Label>Descuento (%)</Label>
                    <Input
                      type="number"
                      value={nuevoItem.descuento}
                      onChange={(e) => setNuevoItem({ ...nuevoItem, descuento: Number.parseFloat(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={agregarItem} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lista de items */}
              {formulario.items.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Items de la Cotización</h3>
                  <div className="space-y-2">
                    {formulario.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.nombreProducto}</div>
                          <div className="text-sm text-gray-600">
                            {item.descripcion && `${item.descripcion} - `}
                            Cantidad: {item.cantidad}
                            {item.ancho && item.alto && ` - ${item.ancho}x${item.alto}cm`}
                            {item.descuento > 0 && ` - Descuento: ${item.descuento}%`}
                          </div>
                        </div>
                        <div className="text-right mr-4">
                          <div className="font-semibold">€{calcularPrecioItem(item).toFixed(2)}</div>
                        </div>
                        <Button type="button" variant="destructive" size="sm" onClick={() => eliminarItem(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totales y configuración */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Configuración</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Descuento Global (%)</Label>
                      <Input
                        type="number"
                        value={formulario.descuentoGlobal}
                        onChange={(e) =>
                          setFormulario({ ...formulario, descuentoGlobal: Number.parseFloat(e.target.value) })
                        }
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label>Impuestos (%)</Label>
                      <Input
                        type="number"
                        value={formulario.impuestos}
                        onChange={(e) => setFormulario({ ...formulario, impuestos: Number.parseFloat(e.target.value) })}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label>Validez (días)</Label>
                      <Input
                        type="number"
                        value={formulario.validezDias}
                        onChange={(e) => setFormulario({ ...formulario, validezDias: Number.parseInt(e.target.value) })}
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {formulario.items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Resumen</h3>
                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                      {(() => {
                        const totales = calcularTotales()
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>€{totales.subtotal}</span>
                            </div>
                            {formulario.descuentoGlobal > 0 && (
                              <div className="flex justify-between text-red-600">
                                <span>Descuento ({formulario.descuentoGlobal}%):</span>
                                <span>-€{totales.descuentoGlobal}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Base Imponible:</span>
                              <span>€{totales.baseImponible}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Impuestos ({formulario.impuestos}%):</span>
                              <span>€{totales.impuestos}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                              <span>Total:</span>
                              <span>€{totales.total}</span>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label>Notas</Label>
                <Textarea
                  value={formulario.notas}
                  onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                  rows={3}
                  placeholder="Notas adicionales para la cotización"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={cargando || formulario.items.length === 0}>
                  {cargando ? "Guardando..." : "Guardar Cotización"}
                </Button>
                <Button type="button" variant="outline" onClick={resetearFormulario}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de cotizaciones */}
      <div className="grid grid-cols-1 gap-4">
        {cotizaciones.map((cotizacion) => (
          <Card key={cotizacion.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{cotizacion.numero}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {cotizacion.cliente.nombre} - {cotizacion.cliente.empresa}
                  </p>
                </div>
                <Badge className={obtenerColorEstado(cotizacion.estado)}>{cotizacion.estado}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {cotizacion.items?.length || 0} items - Total: €{cotizacion.totales?.total || "0.00"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Creada: {new Date(cotizacion.fechaCreacion?.seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {cotizacion.estado === "borrador" && (
                    <Button size="sm" onClick={() => cambiarEstadoCotizacion(cotizacion.id, "enviada")}>
                      <Send className="w-4 h-4 mr-1" />
                      Enviar
                    </Button>
                  )}
                  {cotizacion.estado === "enviada" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cambiarEstadoCotizacion(cotizacion.id, "aprobada")}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cambiarEstadoCotizacion(cotizacion.id, "rechazada")}
                      >
                        Rechazar
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => eliminarCotizacion(cotizacion.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cotizaciones.length === 0 && !cargando && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay cotizaciones registradas</p>
          <Button className="mt-4" onClick={() => setMostrarFormulario(true)}>
            Crear Primera Cotización
          </Button>
        </div>
      )}
    </div>
  )
}

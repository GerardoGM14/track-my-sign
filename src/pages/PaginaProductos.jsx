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

export function PaginaProductos() {
  const { tiendaActual } = useContextoTienda()
  const [productos, setProductos] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [cargando, setCargando] = useState(false)

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    subcategoria: "",
    precioBase: "",
    unidadMedida: "unidad",
    materiales: [],
    acabados: [],
    tiempoProduccion: "",
    activo: true,
  })

  const categorias = [
    "Señalética Exterior",
    "Señalética Interior",
    "Vinilos Decorativos",
    "Impresión Digital",
    "Letras Corpóreas",
    "Displays y Stands",
  ]

  const subcategorias = {
    "Señalética Exterior": ["Tótems", "Vallas", "Banderolas", "Señales de Tráfico"],
    "Señalética Interior": ["Placas", "Directorios", "Señales de Seguridad", "Wayfinding"],
    "Vinilos Decorativos": ["Escaparates", "Paredes", "Vehículos", "Suelos"],
    "Impresión Digital": ["Lonas", "Canvas", "Papel", "Rígidos"],
    "Letras Corpóreas": ["Acero", "Acrílico", "PVC", "Madera"],
    "Displays y Stands": ["Roll-ups", "Photocalls", "Expositores", "Ferias"],
  }

  const unidadesMedida = ["unidad", "m²", "ml", "kg", "horas"]

  useEffect(() => {
    if (tiendaActual) {
      cargarProductos()
    }
  }, [tiendaActual])

  const cargarProductos = async () => {
    try {
      setCargando(true)
      const productosRef = collection(db, "tiendas", tiendaActual.id, "productos")
      const snapshot = await getDocs(productosRef)
      const productosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setProductos(productosData)
    } catch (error) {
      console.error("Error cargando productos:", error)
    } finally {
      setCargando(false)
    }
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()
    try {
      setCargando(true)
      const productosRef = collection(db, "tiendas", tiendaActual.id, "productos")

      const datosProducto = {
        ...formulario,
        precioBase: Number.parseFloat(formulario.precioBase),
        tiempoProduccion: Number.parseInt(formulario.tiempoProduccion),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      }

      if (productoEditando) {
        await updateDoc(doc(db, "tiendas", tiendaActual.id, "productos", productoEditando.id), datosProducto)
      } else {
        await addDoc(productosRef, datosProducto)
      }

      await cargarProductos()
      resetearFormulario()
    } catch (error) {
      console.error("Error guardando producto:", error)
    } finally {
      setCargando(false)
    }
  }

  const eliminarProducto = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteDoc(doc(db, "tiendas", tiendaActual.id, "productos", id))
        await cargarProductos()
      } catch (error) {
        console.error("Error eliminando producto:", error)
      }
    }
  }

  const editarProducto = (producto) => {
    setProductoEditando(producto)
    setFormulario(producto)
    setMostrarFormulario(true)
  }

  const resetearFormulario = () => {
    setFormulario({
      nombre: "",
      descripcion: "",
      categoria: "",
      subcategoria: "",
      precioBase: "",
      unidadMedida: "unidad",
      materiales: [],
      acabados: [],
      tiempoProduccion: "",
      activo: true,
    })
    setProductoEditando(null)
    setMostrarFormulario(false)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
        <Button onClick={() => setMostrarFormulario(true)}>Nuevo Producto</Button>
      </div>

      {mostrarFormulario && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{productoEditando ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={manejarSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Producto</Label>
                  <Input
                    id="nombre"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={formulario.categoria}
                    onValueChange={(value) => setFormulario({ ...formulario, categoria: value, subcategoria: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formulario.categoria && (
                  <div>
                    <Label htmlFor="subcategoria">Subcategoría</Label>
                    <Select
                      value={formulario.subcategoria}
                      onValueChange={(value) => setFormulario({ ...formulario, subcategoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar subcategoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategorias[formulario.categoria]?.map((subcat) => (
                          <SelectItem key={subcat} value={subcat}>
                            {subcat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="precioBase">Precio Base</Label>
                  <Input
                    id="precioBase"
                    type="number"
                    step="0.01"
                    value={formulario.precioBase}
                    onChange={(e) => setFormulario({ ...formulario, precioBase: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="unidadMedida">Unidad de Medida</Label>
                  <Select
                    value={formulario.unidadMedida}
                    onValueChange={(value) => setFormulario({ ...formulario, unidadMedida: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unidadesMedida.map((unidad) => (
                        <SelectItem key={unidad} value={unidad}>
                          {unidad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tiempoProduccion">Tiempo de Producción (días)</Label>
                  <Input
                    id="tiempoProduccion"
                    type="number"
                    value={formulario.tiempoProduccion}
                    onChange={(e) => setFormulario({ ...formulario, tiempoProduccion: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formulario.descripcion}
                  onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={cargando}>
                  {cargando ? "Guardando..." : "Guardar"}
                </Button>
                <Button type="button" variant="outline" onClick={resetearFormulario}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productos.map((producto) => (
          <Card key={producto.id}>
            <CardHeader>
              <CardTitle className="text-lg">{producto.nombre}</CardTitle>
              <p className="text-sm text-gray-600">
                {producto.categoria} - {producto.subcategoria}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{producto.descripcion}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">€{producto.precioBase}</span>
                <span className="text-sm text-gray-500">por {producto.unidadMedida}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Tiempo: {producto.tiempoProduccion} días</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => editarProducto(producto)}>
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => eliminarProducto(producto.id)}>
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {productos.length === 0 && !cargando && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay productos registrados</p>
          <Button className="mt-4" onClick={() => setMostrarFormulario(true)}>
            Crear Primer Producto
          </Button>
        </div>
      )}
    </div>
  )
}

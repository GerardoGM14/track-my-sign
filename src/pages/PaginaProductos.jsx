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
import { Plus, Edit, Trash2, Package, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { toast } from "../hooks/user-toast"

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
      toast({
        title: productoEditando ? "Producto actualizado" : "Producto creado",
        description: productoEditando 
          ? "El producto se ha actualizado correctamente"
          : "El producto se ha creado exitosamente",
      })
    } catch (error) {
      console.error("Error guardando producto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await deleteDoc(doc(db, "tiendas", tiendaActual.id, "productos", id))
      await cargarProductos()
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error eliminando producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto. Intenta nuevamente.",
        variant: "destructive",
      })
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
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Catálogo de Productos</h1>
          <p className="text-sm text-gray-600 mt-1 leading-tight">Gestiona tu catálogo de productos y servicios</p>
        </div>
        <Button 
          onClick={() => setMostrarFormulario(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Formulario en Dialog */}
      <Dialog open={mostrarFormulario} onOpenChange={setMostrarFormulario}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {productoEditando ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>
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

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={cargando}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {cargando ? "Guardando..." : "Guardar"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetearFormulario}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productos.map((producto) => (
          <Card 
            key={producto.id} 
            className="border border-gray-200 rounded-xl shadow-md bg-white hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold text-gray-900 leading-tight truncate">
                      {producto.nombre}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {producto.categoria}
                      </Badge>
                      {producto.subcategoria && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                          {producto.subcategoria}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {producto.descripcion && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-tight">
                  {producto.descripcion}
                </p>
              )}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Precio Base</span>
                  <span className="text-base font-semibold text-gray-900">
                    €{producto.precioBase?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Unidad</span>
                  <span className="text-sm text-gray-700 font-medium">{producto.unidadMedida}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tiempo Producción</span>
                  <span className="text-sm text-gray-700 font-medium">{producto.tiempoProduccion} días</span>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => editarProducto(producto)}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="mr-2 h-3 w-3" />
                  Editar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => eliminarProducto(producto.id)}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {productos.length === 0 && !cargando && (
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-base mb-2">No hay productos registrados</p>
            <p className="text-gray-400 text-sm mb-6">Comienza agregando tu primer producto al catálogo</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setMostrarFormulario(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Producto
            </Button>
          </CardContent>
        </Card>
      )}

      {cargando && productos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando productos...</p>
        </div>
      )}
    </div>
  )
}

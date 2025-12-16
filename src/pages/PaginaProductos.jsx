"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "../lib/firebase"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Plus, Edit, Trash2, Package, X, Search, MoreVertical, Eye, BarChart3, Grid, ChevronDown, Circle, Tag, DollarSign, Hash, Image as ImageIcon, Layers, CheckCircle, Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { toast } from "../hooks/user-toast"

export function PaginaProductos() {
  const { slugTienda } = useParams()
  const { tiendaActual, establecerTiendaPorSlug, cargando: cargandoTienda } = useContextoTienda()
  const [productos, setProductos] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [productosCargados, setProductosCargados] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("all")
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [menuPosicion, setMenuPosicion] = useState({ top: 0, right: 0 })
  const [mostrarSidebar, setMostrarSidebar] = useState(false)
  const [mostrarVerProducto, setMostrarVerProducto] = useState(false)
  const [productoViendo, setProductoViendo] = useState(null)
  const [mostrarOrdenesProducto, setMostrarOrdenesProducto] = useState(false)
  const [productoOrdenes, setProductoOrdenes] = useState(null)
  const [mostrarConfirmarEliminar, setMostrarConfirmarEliminar] = useState(false)
  const [productoAEliminar, setProductoAEliminar] = useState(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const menuRefs = useRef({})

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    subcategoria: "",
    precioBase: "",
    precioVenta: "",
    sku: "",
    stock: "",
    unidadMedida: "unidad",
    materiales: [],
    acabados: [],
    tiempoProduccion: "",
    activo: true,
    imagen: "",
    destacado: false,
    tags: [],
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

  // Cargar tienda desde la URL si no está cargada
  useEffect(() => {
    if (slugTienda && !tiendaActual && !cargandoTienda) {
      establecerTiendaPorSlug(slugTienda)
    }
  }, [slugTienda, tiendaActual, cargandoTienda, establecerTiendaPorSlug])

  useEffect(() => {
    if (tiendaActual) {
      cargarProductos()
    }
  }, [tiendaActual])

  // Mostrar sidebar automáticamente cuando no hay productos (solo después de que se haya cargado)
  useEffect(() => {
    // Solo abrir automáticamente si ya se intentó cargar, no está cargando, y realmente no hay productos
    if (productosCargados && productos.length === 0 && !cargando && tiendaActual && tiendaActual.id) {
      setMostrarSidebar(true)
    } else if (productos.length > 0) {
      setMostrarSidebar(false)
    }
  }, [productosCargados, productos.length, cargando, tiendaActual])

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
        nombre: formulario.nombre || "",
        descripcion: formulario.descripcion || "",
        categoria: formulario.categoria || "",
        subcategoria: formulario.subcategoria || "",
        precioBase: Number.parseFloat(formulario.precioBase || 0),
        precioVenta: Number.parseFloat(formulario.precioVenta || formulario.precioBase || 0),
        sku: formulario.sku || "",
        stock: Number.parseInt(formulario.stock || 0),
        unidadMedida: formulario.unidadMedida || "unidad",
        materiales: formulario.materiales || [],
        acabados: formulario.acabados || [],
        tiempoProduccion: Number.parseInt(formulario.tiempoProduccion || 0),
        activo: productoEditando ? (formulario.activo !== undefined ? formulario.activo : true) : true, // Siempre activo por defecto en productos nuevos
        imagen: formulario.imagen || "",
        destacado: formulario.destacado || false,
        tags: formulario.tags || [],
        fechaCreacion: productoEditando ? productoEditando.fechaCreacion : new Date(),
        fechaActualizacion: new Date(),
      }

      if (productoEditando) {
        await updateDoc(doc(db, "tiendas", tiendaActual.id, "productos", productoEditando.id), datosProducto)
      } else {
        await addDoc(productosRef, datosProducto)
      }

      await cargarProductos()
      resetearFormulario()
      // Cerrar sidebar después de crear producto
      if (!productoEditando) {
        setMostrarSidebar(false)
      }
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

  const manejarArchivo = async (archivo) => {
    console.log("=== manejarArchivo llamado ===", archivo)
    console.log("tiendaActual:", tiendaActual)
    console.log("slugTienda:", slugTienda)
    console.log("cargandoTienda:", cargandoTienda)
    
    // Validar que tiendaActual esté disponible
    if (!tiendaActual || !tiendaActual.id) {
      console.error("tiendaActual no disponible:", tiendaActual)
      
      // Intentar cargar la tienda desde la URL si tenemos el slug
      if (slugTienda && !cargandoTienda) {
        console.log("Intentando cargar tienda desde slug:", slugTienda)
        try {
          await establecerTiendaPorSlug(slugTienda)
          // La tienda se cargará en el siguiente render, pero necesitamos esperar
          toast({
            title: "Cargando tienda...",
            description: "Por favor, intenta subir la imagen nuevamente en un momento.",
            variant: "default",
          })
        } catch (error) {
          console.error("Error cargando tienda:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar la información de la tienda. Por favor, recarga la página.",
            variant: "destructive",
          })
        }
        return
      }
      
      toast({
        title: "Error",
        description: "No se pudo identificar la tienda. Por favor, recarga la página.",
        variant: "destructive",
      })
      return
    }
    
    console.log("tiendaActual válida:", tiendaActual.id)

    // Validar que ya no haya una imagen cargada
    if (formulario.imagen) {
      toast({
        title: "Imagen ya cargada",
        description: "Solo puedes subir una imagen por producto. Elimina la imagen actual si deseas subir otra.",
        variant: "destructive",
      })
      return
    }

    // Validar que sea una imagen
    const formatosPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!formatosPermitidos.includes(archivo.type)) {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten formatos de imagen (JPG, PNG, GIF, WEBP, SVG)",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (máximo 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no debe superar los 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setSubiendoImagen(true)
      
      console.log("Iniciando subida de imagen...", {
        tiendaId: tiendaActual.id,
        nombreArchivo: archivo.name,
        tipo: archivo.type,
        tamaño: archivo.size
      })
      
      // Crear referencia en Firebase Storage
      const nombreArchivo = `${Date.now()}_${archivo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const rutaStorage = `tiendas/${tiendaActual.id}/productos/${nombreArchivo}`
      const storageRef = ref(storage, rutaStorage)
      
      console.log("Ruta de storage:", rutaStorage)
      
      // Subir archivo
      console.log("Subiendo bytes...")
      await uploadBytes(storageRef, archivo)
      console.log("Bytes subidos correctamente")
      
      // Obtener URL de descarga
      console.log("Obteniendo URL de descarga...")
      const downloadURL = await getDownloadURL(storageRef)
      console.log("URL obtenida:", downloadURL)
      
      // Actualizar formulario con la URL
      setFormulario(prev => ({ ...prev, imagen: downloadURL }))
      console.log("Formulario actualizado con URL:", downloadURL)
      
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente",
      })
    } catch (error) {
      console.error("Error subiendo imagen:", error)
      console.error("Detalles del error:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      })
      
      let mensajeError = "No se pudo subir la imagen. Intenta nuevamente."
      
      if (error.code === 'storage/unauthorized') {
        mensajeError = "No tienes permisos para subir imágenes. Verifica la configuración de Firebase Storage."
      } else if (error.code === 'storage/canceled') {
        mensajeError = "La subida fue cancelada."
      } else if (error.code === 'storage/unknown') {
        mensajeError = "Error desconocido. Verifica que Firebase Storage esté configurado correctamente."
      } else if (error.message) {
        mensajeError = `Error: ${error.message}`
      }
      
      toast({
        title: "Error al subir imagen",
        description: mensajeError,
        variant: "destructive",
      })
    } finally {
      setSubiendoImagen(false)
    }
  }

  const eliminarProducto = async (id) => {
    const producto = productos.find(p => p.id === id)
    if (producto) {
      setProductoAEliminar(producto)
      setMostrarConfirmarEliminar(true)
    }
  }

  const confirmarEliminarProducto = async () => {
    if (!productoAEliminar) return
    
    try {
      // Eliminar imagen de Firebase Storage si existe
      if (productoAEliminar.imagen && productoAEliminar.imagen.includes('firebasestorage')) {
        try {
          const imageRef = ref(storage, productoAEliminar.imagen)
          await deleteObject(imageRef)
        } catch (error) {
          console.error("Error eliminando imagen:", error)
          // Continuar aunque falle la eliminación de la imagen
        }
      }

      await deleteDoc(doc(db, "tiendas", tiendaActual.id, "productos", productoAEliminar.id))
      await cargarProductos()
      setMostrarConfirmarEliminar(false)
      setProductoAEliminar(null)
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
    setFormulario({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      categoria: producto.categoria || "",
      subcategoria: producto.subcategoria || "",
      precioBase: producto.precioBase || 0,
      precioVenta: producto.precioVenta || producto.precioBase || 0,
      sku: producto.sku || "",
      stock: producto.stock || 0,
      unidadMedida: producto.unidadMedida || "unidad",
      materiales: producto.materiales || [],
      acabados: producto.acabados || [],
      tiempoProduccion: producto.tiempoProduccion || 0,
      activo: producto.activo !== undefined ? producto.activo : true,
      imagen: producto.imagen || "",
      destacado: producto.destacado || false,
      tags: producto.tags || [],
    })
    setMostrarSidebar(true)
  }

  const resetearFormulario = () => {
    setFormulario({
      nombre: "",
      descripcion: "",
      categoria: "",
      subcategoria: "",
      precioBase: "",
      precioVenta: "",
      sku: "",
      stock: "",
      unidadMedida: "unidad",
      materiales: [],
      acabados: [],
      tiempoProduccion: "",
      activo: true,
      imagen: "",
      destacado: false,
      tags: [],
    })
    setProductoEditando(null)
    setMostrarFormulario(false)
  }

  // Obtener texto del filtro de estado
  const obtenerTextoEstado = (valor) => {
    const estados = {
      all: "Estado",
      active: "Activos",
      inactive: "Inactivos",
      featured: "Destacados",
      outofstock: "Sin Stock"
    }
    return estados[valor] || "Estado"
  }

  // Filtrar productos
  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = !busqueda || 
      producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.sku?.toLowerCase().includes(busqueda.toLowerCase())
    
    const coincideStatus = filtroStatus === "all" ||
      (filtroStatus === "active" && producto.activo) ||
      (filtroStatus === "inactive" && !producto.activo) ||
      (filtroStatus === "featured" && producto.destacado) ||
      (filtroStatus === "outofstock" && (producto.stock === 0 || producto.stock === "0"))
    
    return coincideBusqueda && coincideStatus
  })

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar si el clic está dentro de algún menú abierto
      const menuAbiertoId = menuAbierto
      if (menuAbiertoId) {
        const ref = menuRefs.current[menuAbiertoId]
        // Verificar si el clic está dentro del contenedor del botón o del menú desplegable
        const menuElement = document.querySelector(`[data-menu-id="${menuAbiertoId}"]`)
        if (ref && !ref.contains(event.target) && (!menuElement || !menuElement.contains(event.target))) {
          setMenuAbierto(null)
        }
      }
    }

    if (menuAbierto) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [menuAbierto])

  return (
    <>
    <div className="flex flex-col max-h-[calc(100vh-220px)] px-18 pt-4 pb-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Gestión de Productos</h1>
        <div className="flex items-center gap-3">
          {/* Barra de búsqueda */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o SKU"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
          {/* Dropdown Status */}
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-40 border-gray-300 bg-white hover:bg-gray-50 transition-colors">
              <SelectValue className="flex items-center gap-2">
                {filtroStatus === "active" && <Circle className="h-2 w-2 fill-green-500 text-green-500 flex-shrink-0" />}
                {filtroStatus === "inactive" && <Circle className="h-2 w-2 fill-orange-500 text-orange-500 flex-shrink-0" />}
                {filtroStatus === "featured" && <Circle className="h-2 w-2 fill-yellow-500 text-yellow-500 flex-shrink-0" />}
                {filtroStatus === "outofstock" && <Circle className="h-2 w-2 fill-red-500 text-red-500 flex-shrink-0" />}
                <span className="truncate">{obtenerTextoEstado(filtroStatus)}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg w-40 z-[100]">
              <SelectItem 
                value="all" 
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm rounded-sm pl-8"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5"></span>
                  <span>Todos</span>
                </div>
              </SelectItem>
              <SelectItem 
                value="active" 
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm rounded-sm pl-8"
              >
                <div className="flex items-center gap-2">
                  <Circle className="h-2.5 w-2.5 fill-green-500 text-green-500 flex-shrink-0" />
                  <span>Activos</span>
                </div>
              </SelectItem>
              <SelectItem 
                value="inactive" 
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm rounded-sm pl-8"
              >
                <div className="flex items-center gap-2">
                  <Circle className="h-2.5 w-2.5 fill-orange-500 text-orange-500 flex-shrink-0" />
                  <span>Inactivos</span>
                </div>
              </SelectItem>
              <SelectItem 
                value="featured" 
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm rounded-sm pl-8"
              >
                <div className="flex items-center gap-2">
                  <Circle className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                  <span>Destacados</span>
                </div>
              </SelectItem>
              <SelectItem 
                value="outofstock" 
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm rounded-sm pl-8"
              >
                <div className="flex items-center gap-2">
                  <Circle className="h-2.5 w-2.5 fill-red-500 text-red-500 flex-shrink-0" />
                  <span>Sin Stock</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {/* Botón Add Product */}
          <Button 
            onClick={() => {
              setProductoEditando(null)
              resetearFormulario()
              setMostrarSidebar(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
        </div>
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
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formulario.sku}
                    onChange={(e) => setFormulario({ ...formulario, sku: e.target.value })}
                    placeholder="Ej: UY3749"
                  />
                </div>

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
                  <Label htmlFor="precioVenta">Precio de Venta</Label>
                  <Input
                    id="precioVenta"
                    type="number"
                    step="0.01"
                    value={formulario.precioVenta}
                    onChange={(e) => setFormulario({ ...formulario, precioVenta: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formulario.stock}
                    onChange={(e) => setFormulario({ ...formulario, stock: e.target.value })}
                    placeholder="0"
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
                <Label htmlFor="imagen">URL de Imagen</Label>
                <Input
                  id="imagen"
                  type="url"
                  value={formulario.imagen}
                  onChange={(e) => setFormulario({ ...formulario, imagen: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="destacado"
                  checked={formulario.destacado}
                  onChange={(e) => setFormulario({ ...formulario, destacado: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="destacado" className="cursor-pointer">Producto Destacado</Label>
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

      {/* Tabla de Productos */}
      <Card className={`border border-gray-200 rounded-xl shadow-md bg-white flex flex-col overflow-visible ${productosFiltrados.length > 0 ? 'flex-1' : 'flex-none'}`}>
        <CardContent className={`p-0 flex flex-col overflow-visible ${productosFiltrados.length > 0 ? 'flex-1' : 'flex-none'}`}>
          <div className={`overflow-x-auto ${productosFiltrados.length > 0 ? 'overflow-y-auto flex-1 overflow-x-visible' : 'overflow-y-visible'}`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <Grid className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {productosFiltrados.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {producto.imagen ? (
                          <img 
                            src={producto.imagen} 
                            alt={producto.nombre}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">{producto.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{producto.sku || "N/A"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        €{(producto.precioVenta || producto.precioBase || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{producto.stock ?? 0}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {producto.categoria && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                            {producto.categoria}
                          </Badge>
                        )}
                        {producto.subcategoria && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                            {producto.subcategoria}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {producto.activo ? (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 flex items-center gap-1">
                            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 flex items-center gap-1">
                            <Circle className="h-2 w-2 fill-orange-500 text-orange-500" />
                            Inactivo
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await updateDoc(doc(db, "tiendas", tiendaActual.id, "productos", producto.id), {
                                destacado: !producto.destacado
                              })
                              await cargarProductos()
                              toast({
                                title: producto.destacado ? "Producto removido de destacados" : "Producto destacado",
                                description: producto.destacado 
                                  ? "El producto ya no está destacado"
                                  : "El producto ahora está destacado",
                              })
                            } catch (error) {
                              console.error("Error actualizando producto:", error)
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Star 
                            className={`h-4 w-4 ${
                              producto.destacado 
                                ? "fill-orange-400 text-orange-400" 
                                : "text-gray-400"
                            }`} 
                          />
                        </button>
                        <div className="relative" ref={(el) => { if (el) menuRefs.current[producto.id] = el }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const rect = menuRefs.current[producto.id]?.getBoundingClientRect()
                              if (rect) {
                                setMenuPosicion({
                                  top: rect.bottom + 8,
                                  right: window.innerWidth - rect.right
                                })
                              }
                              setMenuAbierto(menuAbierto === producto.id ? null : producto.id)
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </button>
                          {menuAbierto === producto.id && (
                            <div 
                              data-menu-id={producto.id}
                              className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]" 
                              style={{
                                top: `${menuPosicion.top}px`,
                                right: `${menuPosicion.right}px`
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  editarProducto(producto)
                                  setMenuAbierto(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                              >
                                <Edit className="h-4 w-4 text-gray-500" />
                                Editar Producto
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  console.log("Ver Producto clickeado", producto)
                                  setProductoViendo(producto)
                                  setMostrarVerProducto(true)
                                  setMenuAbierto(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                              >
                                <Eye className="h-4 w-4 text-gray-500" />
                                Ver Producto
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  console.log("Órdenes del Producto clickeado", producto)
                                  setProductoOrdenes(producto)
                                  setMostrarOrdenesProducto(true)
                                  setMenuAbierto(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                              >
                                <BarChart3 className="h-4 w-4 text-gray-500" />
                                Órdenes del Producto
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  console.log("Eliminar Producto clickeado", producto)
                                  eliminarProducto(producto.id)
                                  setMenuAbierto(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-3 transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                                Eliminar Producto
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {productosFiltrados.length === 0 && !cargando && productos.length > 0 && (
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-base mb-2">No se encontraron productos</p>
            <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {productos.length === 0 && !cargando && (
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12 h-full">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-base mb-2">No hay productos registrados</p>
            <p className="text-gray-400 text-sm mb-6">Comienza agregando tu primer producto al catálogo</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setMostrarSidebar(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Producto
            </Button>
          </CardContent>
        </Card>
      )}

      {cargando && productos.length === 0 && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-gray-500">Cargando productos...</p>
          </div>
        </div>
      )}
    </div>

      {/* Overlay oscuro cuando el sidebar está abierto */}
      {mostrarSidebar && (
        <div 
          className="fixed inset-0 bg-gray-600/40 z-[100] transition-opacity duration-300"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0
          }}
          onClick={() => setMostrarSidebar(false)}
        />
      )}

      {/* Sidebar temporal */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${
          mostrarSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto bg-gray-50">
          {/* Header mejorado */}
          <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Nuevo Producto</h2>
                  <p className="text-sm text-gray-500">Completa la información del producto</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6">
            <form onSubmit={manejarSubmit} className="space-y-6">
              {/* Sección: Información Básica */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Layers className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Información Básica</h3>
                </div>
                
                <div>
                  <Label htmlFor="nombre-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-gray-400" />
                    Título del Producto <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre-sidebar"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    placeholder="Ingresa el nombre del producto"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="categoria-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-gray-400" />
                    Categoría <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formulario.categoria}
                    onValueChange={(value) => setFormulario({ ...formulario, categoria: value, subcategoria: "" })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-[102]">
                      {categorias.map((cat) => (
                        <SelectItem 
                          key={cat} 
                          value={cat}
                          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm"
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sección: Precios y Stock */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Precios y Stock</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="precioBase-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Precio Regular <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                      <Input
                        id="precioBase-sidebar"
                        type="number"
                        step="0.01"
                        value={formulario.precioBase}
                        onChange={(e) => setFormulario({ ...formulario, precioBase: e.target.value })}
                        placeholder="0.00"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-8"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="precioVenta-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Precio de Venta
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                      <Input
                        id="precioVenta-sidebar"
                        type="number"
                        step="0.01"
                        value={formulario.precioVenta}
                        onChange={(e) => setFormulario({ ...formulario, precioVenta: e.target.value })}
                        placeholder="0.00"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-gray-400" />
                      Stock
                    </Label>
                    <Input
                      id="stock-sidebar"
                      type="number"
                      value={formulario.stock}
                      onChange={(e) => setFormulario({ ...formulario, stock: e.target.value })}
                      placeholder="0"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sku-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-gray-400" />
                      SKU
                    </Label>
                    <Input
                      id="sku-sidebar"
                      value={formulario.sku}
                      onChange={(e) => setFormulario({ ...formulario, sku: e.target.value })}
                      placeholder="Ej: UY3749"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sección: Clasificación */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Tag className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Clasificación</h3>
                </div>

                <div>
                  <Label htmlFor="tags-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    Etiquetas
                  </Label>
                  <Input
                    id="tags-sidebar"
                    placeholder="Separadas por comas (ej: etiqueta1, etiqueta2)"
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      setFormulario({ ...formulario, tags: tags })
                    }}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Presiona Enter o usa comas para separar</p>
                </div>
              </div>

              {/* Sección: Imagen */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <ImageIcon className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Imagen del Producto</h3>
                </div>

                {formulario.imagen ? (
                  // Vista de lista cuando hay imagen cargada
                  <div className="border border-gray-200 rounded-md bg-white">
                    <div className="flex items-center gap-4 p-4">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={formulario.imagen} 
                          alt="Imagen del producto" 
                          className="w-20 h-20 rounded-md object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EImagen%3C/text%3E%3C/svg%3E'
                          }}
                        />
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-md">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <p className="text-sm font-medium text-gray-900 truncate">Imagen cargada</p>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{formulario.imagen}</p>
                        <p className="text-xs text-gray-400 mt-1">Solo se permite una imagen por producto</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormulario({ ...formulario, imagen: "" })}
                        className="flex-shrink-0 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar imagen"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Área de arrastrar y soltar cuando no hay imagen
                  <>
                    <div
                      className={`border-2 border-dashed rounded-md p-8 text-center transition-colors ${
                        isDragging 
                          ? "border-blue-500 bg-blue-50 cursor-pointer" 
                          : "border-gray-300 hover:border-blue-400 bg-white cursor-pointer"
                      }`}
                      onDragEnter={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsDragging(true)
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsDragging(false)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsDragging(false)
                        
                        console.log("Archivo soltado, files:", e.dataTransfer.files)
                        const files = e.dataTransfer.files
                        if (files && files.length > 0) {
                          console.log("Llamando manejarArchivo con:", files[0])
                          manejarArchivo(files[0])
                        }
                      }}
                      onClick={() => {
                        console.log("Click en área de drop, subiendoImagen:", subiendoImagen)
                        if (!subiendoImagen) {
                          console.log("Abriendo selector de archivos")
                          fileInputRef.current?.click()
                        }
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                        className="hidden"
                    onChange={(e) => {
                      console.log("Input file onChange disparado, files:", e.target.files)
                      if (e.target.files && e.target.files.length > 0) {
                        console.log("Llamando manejarArchivo con archivo seleccionado:", e.target.files[0])
                        manejarArchivo(e.target.files[0])
                        e.target.value = '' // Reset input
                      }
                    }}
                      />
                      {subiendoImagen ? (
                        <div className="space-y-3">
                          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                          <p className="text-sm text-gray-600">Subiendo imagen...</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              Arrastra y suelta el archivo aquí
                            </p>
                            <p className="text-xs text-gray-500 mt-1">o haz clic para seleccionar</p>
                            <p className="text-xs text-gray-400 mt-2 font-medium">Formatos permitidos: JPG, PNG, GIF, WEBP, SVG</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="imagen-url-sidebar" className="text-xs text-gray-500 mb-1 block">
                        O ingresa una URL de imagen
                      </Label>
                      <Input
                        id="imagen-url-sidebar"
                        type="url"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={formulario.imagen}
                        onChange={(e) => setFormulario({ ...formulario, imagen: e.target.value })}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Botones de acción mejorados */}
              <div className="flex gap-3 pt-6 sticky bottom-0 bg-gray-50 pb-6 border-t border-gray-200 -mx-6 px-6 mt-6">
                <Button 
                  type="submit" 
                  disabled={cargando}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1 h-11 font-medium shadow-sm"
                >
                  {cargando ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Producto
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetearFormulario()
                    setMostrarSidebar(false)
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 h-11 px-6"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Ver Producto */}
      <Dialog open={mostrarVerProducto} onOpenChange={setMostrarVerProducto}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {productoViendo?.nombre || "Detalles del Producto"}
            </DialogTitle>
          </DialogHeader>
          {productoViendo && (
            <div className="space-y-6">
              {productoViendo.imagen && (
                <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={productoViendo.imagen} 
                    alt={productoViendo.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Nombre</Label>
                  <p className="text-sm text-gray-900 mt-1">{productoViendo.nombre}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">SKU</Label>
                  <p className="text-sm text-gray-900 mt-1">{productoViendo.sku || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Precio Base</Label>
                  <p className="text-sm text-gray-900 mt-1">€{(productoViendo.precioBase || 0).toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Precio Venta</Label>
                  <p className="text-sm text-gray-900 mt-1">€{(productoViendo.precioVenta || productoViendo.precioBase || 0).toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Stock</Label>
                  <p className="text-sm text-gray-900 mt-1">{productoViendo.stock ?? 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Estado</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {productoViendo.activo ? (
                      <Badge className="bg-green-100 text-green-700">Activo</Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-700">Inactivo</Badge>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Categoría</Label>
                  <p className="text-sm text-gray-900 mt-1">{productoViendo.categoria || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Subcategoría</Label>
                  <p className="text-sm text-gray-900 mt-1">{productoViendo.subcategoria || "N/A"}</p>
                </div>
              </div>
              {productoViendo.descripcion && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Descripción</Label>
                  <p className="text-sm text-gray-900 mt-1">{productoViendo.descripcion}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Órdenes del Producto */}
      <Dialog open={mostrarOrdenesProducto} onOpenChange={setMostrarOrdenesProducto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Órdenes del Producto: {productoOrdenes?.nombre}
            </DialogTitle>
          </DialogHeader>
          {productoOrdenes && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Aquí puedes ver todas las órdenes que incluyen este producto y los clientes que lo han comprado.
              </p>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500 text-center py-8">
                  Funcionalidad en desarrollo. Aquí se mostrarán las órdenes relacionadas con este producto.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Eliminar */}
      <Dialog open={mostrarConfirmarEliminar} onOpenChange={setMostrarConfirmarEliminar}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              ¿Eliminar Producto?
            </DialogTitle>
          </DialogHeader>
          {productoAEliminar && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Estás a punto de eliminar el producto <strong>{productoAEliminar.nombre}</strong>. Esta acción no se puede deshacer.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-yellow-800">Advertencias:</p>
                <div className="space-y-1 text-sm text-yellow-700">
                  <p>• Stock actual: <strong>{productoAEliminar.stock ?? 0} unidades</strong></p>
                  <p>• Estado: <strong>{productoAEliminar.activo ? "Activo" : "Inactivo"}</strong></p>
                  {productoAEliminar.stock > 0 && (
                    <p className="text-red-600 font-semibold">⚠️ Este producto tiene stock disponible. Al eliminarlo, se perderá esta información.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => {
                    setMostrarConfirmarEliminar(false)
                    setProductoAEliminar(null)
                  }}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmarEliminarProducto}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Eliminar Producto
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

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
import { Plus, Edit, Trash2, Package, X, Search, MoreVertical, Eye, BarChart3, Grid, ChevronDown, Circle, Tag, DollarSign, Hash, Image as ImageIcon, Layers, CheckCircle, Star, Heart, ShoppingCart, Minus, FileText, Users, Calendar, DollarSign as DollarIcon, TrendingUp, Clock, CheckCircle2, PlayCircle, AlertCircle } from "lucide-react"
import deleteIcon from "../assets/delete.svg"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { toast } from "../hooks/user-toast"
import { LoadingSpinner } from "../components/ui/loading-spinner"

export function PaginaProductos() {
  const { slugTienda } = useParams()
  const { tiendaActual, establecerTiendaPorSlug, cargando: cargandoTienda } = useContextoTienda()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [unidadesMedida, setUnidadesMedida] = useState([])
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
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [mostrarOrdenesProducto, setMostrarOrdenesProducto] = useState(false)
  const [productoOrdenes, setProductoOrdenes] = useState(null)
  const [ordenesDelProducto, setOrdenesDelProducto] = useState([])
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false)
  const [busquedaOrdenes, setBusquedaOrdenes] = useState("")
  const [filtroEstadoOrden, setFiltroEstadoOrden] = useState("all")
  const [mostrarConfirmarEliminar, setMostrarConfirmarEliminar] = useState(false)
  const [productoAEliminar, setProductoAEliminar] = useState(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [imagenesSubiendo, setImagenesSubiendo] = useState(0)
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
    porcentajeDescuento: "",
    sku: "",
    stock: "",
    unidadMedida: "unidad",
    materiales: [],
    acabados: [],
    tiempoProduccion: "",
    activo: true,
    imagenes: [],
    destacado: false,
    tags: [],
  })


  // Cargar tienda desde la URL si no está cargada
  useEffect(() => {
    if (slugTienda && !tiendaActual && !cargandoTienda) {
      establecerTiendaPorSlug(slugTienda)
    }
  }, [slugTienda, tiendaActual, cargandoTienda, establecerTiendaPorSlug])

  useEffect(() => {
    if (tiendaActual) {
      cargarProductos()
      cargarMaestros()
    }
  }, [tiendaActual])

  const cargarMaestros = async () => {
    try {
      // Cargar categorías
      const categoriasRef = collection(db, "tiendas", tiendaActual.id, "categorias")
      const categoriasSnap = await getDocs(categoriasRef)
      setCategorias(categoriasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))

      // Cargar subcategorías
      const subcategoriasRef = collection(db, "tiendas", tiendaActual.id, "subcategorias")
      const subcategoriasSnap = await getDocs(subcategoriasRef)
      const subcategoriasData = subcategoriasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setSubcategorias(subcategoriasData)

      // Cargar unidades de medida
      const unidadesRef = collection(db, "tiendas", tiendaActual.id, "unidadesMedida")
      const unidadesSnap = await getDocs(unidadesRef)
      setUnidadesMedida(unidadesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (error) {
      console.error("Error cargando maestros:", error)
    }
  }

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
        precioVenta: Number.parseFloat(formulario.precioVenta || 0),
        precioBase: Number.parseFloat(formulario.precioBase || formulario.precioVenta || 0),
        porcentajeDescuento: Number.parseFloat(formulario.porcentajeDescuento || 0),
        sku: formulario.sku || "",
        stock: Number.parseInt(formulario.stock || 0),
        unidadMedida: formulario.unidadMedida || "unidad",
        materiales: formulario.materiales || [],
        acabados: formulario.acabados || [],
        tiempoProduccion: Number.parseInt(formulario.tiempoProduccion || 0),
        activo: productoEditando ? (formulario.activo !== undefined ? formulario.activo : true) : true,
        imagenes: formulario.imagenes || [],
        // Mantener compatibilidad con productos antiguos que tienen 'imagen' (string)
        imagen: formulario.imagenes && formulario.imagenes.length > 0 ? formulario.imagenes[0] : "",
        // Mantener el destacado actual cuando se edita (solo se cambia desde la tabla)
        destacado: productoEditando ? (productoEditando.destacado || false) : false,
        tags: formulario.tags || [],
        fechaCreacion: productoEditando ? productoEditando.fechaCreacion : new Date(),
        fechaActualizacion: new Date(),
      }

      if (productoEditando) {
        await updateDoc(doc(db, "tiendas", tiendaActual.id, "productos", productoEditando.id), datosProducto)
      } else {
        await addDoc(productosRef, datosProducto)
      }

      // Cerrar sidebar inmediatamente para mejor UX
      resetearFormulario()
      setProductoEditando(null)
      setMostrarSidebar(false)
      
      // Mostrar toast inmediatamente
      toast({
        title: productoEditando ? "Producto actualizado" : "Producto creado",
        description: productoEditando 
          ? "El producto se ha actualizado correctamente"
          : "El producto se ha creado exitosamente",
      })
      
      // Cargar productos en segundo plano
      cargarProductos().catch(error => {
        console.error("Error recargando productos:", error)
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

    // Validar límite de imágenes (máximo 10)
    if (formulario.imagenes && formulario.imagenes.length >= 10) {
      toast({
        title: "Límite alcanzado",
        description: "Puedes subir un máximo de 10 imágenes por producto.",
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
      setImagenesSubiendo(prev => prev + 1)
      
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
      
      // Actualizar formulario agregando la nueva imagen al array
      setFormulario(prev => ({ 
        ...prev, 
        imagenes: [...(prev.imagenes || []), downloadURL]
      }))
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
      setImagenesSubiendo(prev => {
        const nuevo = prev - 1
        if (nuevo <= 0) {
          setSubiendoImagen(false)
          return 0
        }
        return nuevo
      })
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

  // Cargar órdenes del producto
  const cargarOrdenesDelProducto = async (producto) => {
    if (!tiendaActual || !producto) return
    
    try {
      setCargandoOrdenes(true)
      const ordenesRef = collection(db, "tiendas", tiendaActual.id, "ordenes")
      const ordenesSnapshot = await getDocs(ordenesRef)
      
      // Filtrar órdenes que contengan el producto
      const ordenesFiltradas = ordenesSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((orden) => {
          if (!orden.items || !Array.isArray(orden.items)) return false
          return orden.items.some((item) => {
            // Buscar por ID del producto, SKU o nombre
            return (
              item.productoId === producto.id ||
              item.sku === producto.sku ||
              item.nombre === producto.nombre ||
              item.productoNombre === producto.nombre
            )
          })
        })
        .map((orden) => {
          // Encontrar el item específico del producto en la orden
          const itemProducto = orden.items.find((item) => {
            return (
              item.productoId === producto.id ||
              item.sku === producto.sku ||
              item.nombre === producto.nombre ||
              item.productoNombre === producto.nombre
            )
          })
          return {
            ...orden,
            itemProducto,
            cantidadProducto: itemProducto?.cantidad || 0,
            subtotalProducto: itemProducto?.subtotal || 0,
          }
        })
      
      setOrdenesDelProducto(ordenesFiltradas)
    } catch (error) {
      console.error("Error cargando órdenes del producto:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes del producto.",
        variant: "destructive",
      })
    } finally {
      setCargandoOrdenes(false)
    }
  }

  // Cargar órdenes cuando se abre el modal
  useEffect(() => {
    if (mostrarOrdenesProducto && productoOrdenes && tiendaActual) {
      cargarOrdenesDelProducto(productoOrdenes)
    }
  }, [mostrarOrdenesProducto, productoOrdenes, tiendaActual])

  const editarProducto = (producto) => {
    setProductoEditando(producto)
    setFormulario({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      categoria: producto.categoria || "",
      subcategoria: producto.subcategoria || "",
      precioVenta: producto.precioVenta || producto.precioBase || 0,
      precioBase: producto.precioBase || producto.precioVenta || 0,
      porcentajeDescuento: producto.porcentajeDescuento || (producto.precioBase && producto.precioVenta && producto.precioBase > producto.precioVenta 
        ? Math.round(((producto.precioBase - producto.precioVenta) / producto.precioBase) * 100 * 10) / 10 
        : ""),
      sku: producto.sku || "",
      stock: producto.stock || 0,
      unidadMedida: producto.unidadMedida || "unidad",
      materiales: producto.materiales || [],
      acabados: producto.acabados || [],
      tiempoProduccion: producto.tiempoProduccion || 0,
      activo: producto.activo !== undefined ? producto.activo : true,
      // Soporte para productos antiguos con 'imagen' (string) y nuevos con 'imagenes' (array)
      imagenes: producto.imagenes || (producto.imagen ? [producto.imagen] : []),
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
      porcentajeDescuento: "",
      sku: "",
      stock: "",
      unidadMedida: "unidad",
      materiales: [],
      acabados: [],
      tiempoProduccion: "",
      activo: true,
      imagenes: [],
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
                {filtroStatus === "featured" && <Star className="h-2 w-2 fill-yellow-500 text-yellow-500 flex-shrink-0" />}
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
                  <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500 flex-shrink-0" />
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
                        {subcategorias
                          .filter(subcat => subcat.categoria === formulario.categoria)
                          .map((subcat) => (
                            <SelectItem key={subcat.id} value={subcat.nombre}>
                              {subcat.nombre}
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
                        <SelectItem key={unidad.id || unidad} value={unidad.simbolo || unidad.nombre || unidad}>
                          {unidad.simbolo || unidad.nombre || unidad}
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
      <Card className={`border border-gray-200 rounded-2xl shadow-md bg-white flex flex-col overflow-hidden ${productosFiltrados.length > 0 ? 'flex-1' : 'flex-none'}`}>
        <CardContent className={`p-0 flex flex-col overflow-visible ${productosFiltrados.length > 0 ? 'flex-1' : 'flex-none'}`}>
          <div className={`overflow-x-auto ${productosFiltrados.length > 0 ? 'overflow-y-auto flex-1' : 'overflow-y-visible'}`}>
            <div className="min-w-[640px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left first:pl-4 last:pr-4">
                      <input type="checkbox" className="rounded-md border-gray-300" />
                  </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Nombre
                  </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 tracking-wider hidden sm:table-cell">
                    SKU
                  </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Precio
                  </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 tracking-wider hidden md:table-cell">
                    Stock
                  </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 tracking-wider hidden lg:table-cell">
                    Categoría
                  </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                    Estado
                  </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex">
                        <Grid className="h-4 w-4 text-gray-600" />
                      </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {productosFiltrados.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 sm:px-4 py-3 sm:py-4 first:pl-4 last:pr-4">
                        <input type="checkbox" className="rounded-md border-gray-300" />
                    </td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                        {producto.imagen ? (
                          <img 
                            src={producto.imagen} 
                            alt={producto.nombre}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          </div>
                        )}
                          <div className="min-w-0 flex-1">
                            <span className="text-xs sm:text-sm font-medium text-gray-900 block truncate">{producto.nombre}</span>
                            <span className="text-[10px] sm:text-xs text-gray-500 sm:hidden">{producto.sku || "N/A"}</span>
                          </div>
                      </div>
                    </td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                        <span className="text-xs sm:text-sm text-gray-700">{producto.sku || "N/A"}</span>
                    </td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4">
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                        €{(producto.precioVenta || producto.precioBase || 0).toFixed(2)}
                      </span>
                    </td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                        <span className="text-xs sm:text-sm text-gray-700">{producto.stock ?? 0}</span>
                    </td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                        {producto.categoria && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 rounded-lg px-2 py-0.5">
                            {producto.categoria}
                          </Badge>
                        )}
                        {producto.subcategoria && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 rounded-lg px-2 py-0.5">
                            {producto.subcategoria}
                          </Badge>
                        )}
                      </div>
                    </td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        {producto.activo ? (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 flex items-center gap-1 rounded-lg px-2 py-0.5">
                            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 flex items-center gap-1 rounded-lg px-2 py-0.5">
                            <Circle className="h-2 w-2 fill-orange-500 text-orange-500" />
                            Inactivo
                          </Badge>
                        )}
                        {producto.destacado && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 flex items-center gap-1 rounded-lg px-2 py-0.5">
                            <Star className="h-2 w-2 fill-yellow-500 text-yellow-500" />
                            Destacado
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const nuevoDestacado = !producto.destacado
                              await updateDoc(doc(db, "tiendas", tiendaActual.id, "productos", producto.id), {
                                destacado: nuevoDestacado,
                                // Si se marca como destacado, debe estar activo
                                activo: nuevoDestacado ? true : producto.activo
                              })
                              // Cargar productos en segundo plano para mejor UX
                              cargarProductos().catch(error => {
                                console.error("Error recargando productos:", error)
                              })
                              toast({
                                title: producto.destacado ? "Producto removido de destacados" : "Producto destacado",
                                description: producto.destacado 
                                  ? "El producto ya no está destacado"
                                  : "El producto ahora está destacado y activo",
                              })
                            } catch (error) {
                              console.error("Error actualizando producto:", error)
                              toast({
                                title: "Error",
                                description: "No se pudo actualizar el producto",
                                variant: "destructive",
                              })
                            }
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
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
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </button>
                          {menuAbierto === producto.id && (
                            <div 
                              data-menu-id={producto.id}
                              className="fixed w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-[9999]" 
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
        <LoadingSpinner texto="Cargando productos..." />
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
          onClick={() => {
            setMostrarSidebar(false)
            setProductoEditando(null)
            resetearFormulario()
          }}
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
                  <h2 className="text-xl font-bold text-gray-900">
                    {productoEditando ? "Editar Producto" : "Nuevo Producto"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {productoEditando ? "Modifica la información del producto" : "Completa la información del producto"}
                  </p>
              </div>
              </div>
              <button
                onClick={() => {
            setMostrarSidebar(false)
            setProductoEditando(null)
            resetearFormulario()
          }}
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
                          key={cat.id || cat} 
                          value={cat.nombre || cat}
                          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm"
                        >
                          {cat.nombre || cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="descripcion-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    Descripción del Producto
                  </Label>
                  <Textarea
                    id="descripcion-sidebar"
                    value={formulario.descripcion}
                    onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                    placeholder="Describe las características y detalles del producto..."
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px] resize-y"
                    rows={4}
                  />
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
                    <Label htmlFor="precioVenta-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Precio de Venta <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                      <Input
                        id="precioVenta-sidebar"
                        type="number"
                        step="0.01"
                        value={formulario.precioVenta}
                        onChange={(e) => {
                          const precioVenta = e.target.value
                          const porcentaje = parseFloat(formulario.porcentajeDescuento) || 0
                          let precioBase = precioVenta
                          if (precioVenta && porcentaje > 0) {
                            precioBase = (parseFloat(precioVenta) / (1 - porcentaje / 100)).toFixed(2)
                          }
                          setFormulario({ ...formulario, precioVenta, precioBase })
                        }}
                        placeholder="0.00"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-8"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="porcentajeDescuento-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      % Descuento
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                      <Input
                        id="porcentajeDescuento-sidebar"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formulario.porcentajeDescuento}
                        onChange={(e) => {
                          const porcentaje = e.target.value
                          const precioVenta = parseFloat(formulario.precioVenta) || 0
                          let precioBase = formulario.precioBase
                          if (precioVenta && porcentaje) {
                            precioBase = (precioVenta / (1 - parseFloat(porcentaje) / 100)).toFixed(2)
                          }
                          setFormulario({ ...formulario, porcentajeDescuento: porcentaje, precioBase })
                        }}
                        placeholder="0"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-8"
                      />
                    </div>
                    {formulario.porcentajeDescuento && parseFloat(formulario.porcentajeDescuento) > 0 && formulario.precioVenta && (
                      <p className="text-xs text-gray-500 mt-1">
                        Precio original: €{formulario.precioBase || '0.00'}
                      </p>
                    )}
                  </div>
                </div>
                
                {formulario.porcentajeDescuento && parseFloat(formulario.porcentajeDescuento) > 0 && formulario.precioVenta && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-xs text-blue-700">
                      <span className="font-semibold">Precio de venta:</span> €{formulario.precioVenta} 
                      <span className="text-gray-500 line-through ml-2">€{formulario.precioBase || '0.00'}</span>
                      <span className="ml-2 text-blue-600 font-semibold">({formulario.porcentajeDescuento}% OFF)</span>
                    </p>
                  </div>
                )}

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

                {productoEditando && (
                  <div>
                    <Label htmlFor="estado-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Circle className="h-3.5 w-3.5 text-gray-400" />
                      Estado <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formulario.activo ? "activo" : "inactivo"}
                      onValueChange={(value) => {
                        setFormulario({ ...formulario, activo: value === "activo" })
                      }}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full">
                        <SelectValue placeholder="Seleccionar estado">
                          <div className="flex items-center gap-2">
                            <Circle className={`h-2.5 w-2.5 ${formulario.activo ? 'fill-green-500 text-green-500' : 'fill-orange-500 text-orange-500'}`} />
                            <span>{formulario.activo ? "Activo" : "Inactivo"}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-[102]">
                        <SelectItem 
                          value="activo"
                          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 pl-8"
                        >
                          <div className="flex items-center gap-2">
                            <Circle className="h-2.5 w-2.5 fill-green-500 text-green-500" />
                            <span>Activo</span>
                          </div>
                        </SelectItem>
                        <SelectItem 
                          value="inactivo"
                          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 pl-8"
                        >
                          <div className="flex items-center gap-2">
                            <Circle className="h-2.5 w-2.5 fill-orange-500 text-orange-500" />
                            <span>Inactivo</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="tags-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    Etiquetas
                  </Label>
                  <Input
                    id="tags-sidebar"
                    value={formulario.tags?.join(', ') || ''}
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

                {/* Input file siempre disponible (oculto) - fuera del condicional para que siempre esté accesible */}
                <input
                  key="file-input-multiple"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    console.log("Input file onChange disparado, files:", e.target.files)
                    if (e.target.files && e.target.files.length > 0) {
                      const files = Array.from(e.target.files)
                      const maxFiles = 10 - (formulario.imagenes?.length || 0)
                      const filesToProcess = files.slice(0, maxFiles)
                      
                      if (files.length > maxFiles) {
                        toast({
                          title: "Límite de imágenes",
                          description: `Solo se procesarán ${maxFiles} imagen(es). Puedes subir un máximo de 10 imágenes.`,
                          variant: "default",
                        })
                      }
                      
                      // Procesar cada archivo
                      filesToProcess.forEach(file => {
                        manejarArchivo(file)
                      })
                      e.target.value = '' // Reset input
                    }
                  }}
                />

                {formulario.imagenes && formulario.imagenes.length > 0 ? (
                  // Vista de lista cuando hay imágenes cargadas
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">
                        {formulario.imagenes.length} imagen(es) cargada(s) {formulario.imagenes.length < 10 && `(máximo 10)`}
                      </p>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {formulario.imagenes.map((imagen, index) => (
                        <div key={index} className="border border-gray-200 rounded-md bg-white p-3">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <img 
                                src={imagen} 
                                alt={`Imagen ${index + 1}`}
                                className="w-16 h-16 rounded-md object-cover border border-gray-200"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23f3f4f6" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3EImg%3C/text%3E%3C/svg%3E'
                                }}
                              />
                              <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 shadow-md">
                                <CheckCircle className="h-2.5 w-2.5" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">Imagen {index + 1}</p>
                              <p className="text-xs text-gray-500 truncate">{imagen.substring(0, 50)}...</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const nuevasImagenes = formulario.imagenes.filter((_, i) => i !== index)
                                setFormulario({ ...formulario, imagenes: nuevasImagenes })
                              }}
                              className="flex-shrink-0 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              title="Eliminar imagen"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Indicador de carga cuando se están subiendo imágenes */}
                    {(subiendoImagen || imagenesSubiendo > 0) && (
                      <div className="border border-blue-200 rounded-md bg-blue-50 p-4 mt-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                              {imagenesSubiendo > 1 
                                ? `Subiendo ${imagenesSubiendo} imágenes...` 
                                : 'Subiendo imagen...'}
                            </p>
                            <p className="text-xs text-blue-700 mt-1">Por favor espera mientras se procesan las imágenes</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {formulario.imagenes.length < 10 && (
                      <button
                        type="button"
                        disabled={subiendoImagen || imagenesSubiendo > 0}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (subiendoImagen || imagenesSubiendo > 0) return
                          console.log("Botón Agregar más imágenes clickeado")
                          console.log("fileInputRef.current:", fileInputRef.current)
                          // Usar setTimeout para asegurar que el click se procese correctamente
                          setTimeout(() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.click()
                            } else {
                              console.error("fileInputRef.current es null")
                            }
                          }, 0)
                        }}
                        className={`w-full mt-2 py-2 px-4 text-sm border border-blue-200 rounded-md transition-colors ${
                          (subiendoImagen || imagenesSubiendo > 0)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'
                        }`}
                      >
                        {(subiendoImagen || imagenesSubiendo > 0) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 inline-block mr-1"></div>
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 inline mr-1" />
                            Agregar más imágenes
                          </>
                        )}
                      </button>
                    )}
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
                        const files = Array.from(e.dataTransfer.files)
                        if (files && files.length > 0) {
                          const maxFiles = 10 - (formulario.imagenes?.length || 0)
                          const filesToProcess = files.slice(0, maxFiles)
                          
                          if (files.length > maxFiles) {
                            toast({
                              title: "Límite de imágenes",
                              description: `Solo se procesarán ${maxFiles} imagen(es). Puedes subir un máximo de 10 imágenes.`,
                              variant: "default",
                            })
                          }
                          
                          // Procesar cada archivo
                          filesToProcess.forEach(file => {
                            manejarArchivo(file)
                          })
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
                            <p className="text-xs text-gray-400 mt-2 font-medium">
                              Formatos permitidos: JPG, PNG, GIF, WEBP, SVG (máximo 10 imágenes)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="imagen-url-sidebar" className="text-xs text-gray-500 mb-1 block">
                        O ingresa URLs de imágenes (una por línea)
                      </Label>
                      <Textarea
                        id="imagen-url-sidebar"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-xs min-h-[80px]"
                        placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) => {
                          const urls = e.target.value
                            .split('\n')
                            .map(url => url.trim())
                            .filter(url => url && url.startsWith('http'))
                          if (urls.length > 0) {
                            const nuevasImagenes = [...(formulario.imagenes || []), ...urls].slice(0, 10)
                            setFormulario({ ...formulario, imagenes: nuevasImagenes })
                            e.target.value = ''
                          }
                        }}
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
                      {productoEditando ? (
                        <>
                          <Edit className="mr-2 h-4 w-4" />
                          Guardar Cambios
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Producto
                        </>
                      )}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetearFormulario()
                    setProductoEditando(null)
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

      {/* Overlay oscuro cuando el modal Ver Producto está abierto */}
      {mostrarVerProducto && (
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
          onClick={() => {
            setMostrarVerProducto(false)
            setImagenSeleccionada(0)
            setCantidad(1)
          }}
        />
      )}

      {/* Modal Ver Producto - Diseño tipo e-commerce */}
      {mostrarVerProducto && productoViendo && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con botón cerrar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Detalles del Producto</h2>
              <button
                onClick={() => {
                  setMostrarVerProducto(false)
                  setImagenSeleccionada(0)
                  setCantidad(1)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Columna izquierda - Imágenes */}
                <div className="space-y-4">
                  {/* Imagen principal */}
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shadow-md">
                    {(() => {
                      const imagenes = productoViendo.imagenes || (productoViendo.imagen ? [productoViendo.imagen] : [])
                      const imagenActual = imagenes[imagenSeleccionada]
                      return imagenActual ? (
                        <img 
                          src={imagenActual} 
                          alt={productoViendo.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-24 w-24 text-gray-400" />
                      )
                    })()}
                  </div>
                  
                  {/* Thumbnails */}
                  {(() => {
                    const imagenes = productoViendo.imagenes || (productoViendo.imagen ? [productoViendo.imagen] : [])
                    return imagenes.length > 1 && (
                      <div className="flex gap-2 flex-wrap">
                        {imagenes.map((imagen, index) => (
                          <button
                            key={index}
                            onClick={() => setImagenSeleccionada(index)}
                            className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              imagenSeleccionada === index 
                                ? 'border-blue-600 ring-2 ring-blue-200 scale-105' 
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <img 
                              src={imagen} 
                              alt={`${productoViendo.nombre} - Imagen ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )
                  })()}
      </div>

                {/* Columna derecha - Información del producto */}
                <div className="space-y-6">
                  {/* Nombre del producto con badge destacado */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h1 className="text-3xl font-bold text-gray-900 flex-1">
                        {productoViendo.nombre}
                      </h1>
                      {productoViendo.destacado && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 flex items-center gap-1 flex-shrink-0">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          Producto Destacado
                        </Badge>
                      )}
                    </div>
                    
                    {/* Descripción debajo del título */}
                    {productoViendo.descripcion && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {productoViendo.descripcion}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Rating con botón de favoritos */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`h-5 w-5 ${
                              star <= 4 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">4.5 (2 reseñas)</span>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-gray-300 hover:bg-gray-50 p-2"
                      onClick={() => {
                        toast({
                          title: "Agregado a favoritos",
                          description: `"${productoViendo.nombre}" se agregó a tus favoritos`,
                        })
                      }}
                    >
                      <Heart className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>

                  {/* Precio destacado - alineado a la derecha */}
                  <div className="py-4 border-y border-gray-200 flex justify-end">
                    {productoViendo.precioBase && productoViendo.precioVenta && productoViendo.precioBase > productoViendo.precioVenta ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-xl text-gray-400 line-through">
                          €{productoViendo.precioBase.toFixed(2)}
                        </span>
                        <span className="text-4xl font-bold text-blue-600">
                          €{productoViendo.precioVenta.toFixed(2)}
                        </span>
                        <Badge className="bg-red-100 text-red-700 text-xs px-2 py-1">
                          {Math.round(((productoViendo.precioBase - productoViendo.precioVenta) / productoViendo.precioBase) * 100)}% OFF
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-4xl font-bold text-blue-600">
                        €{(productoViendo.precioVenta || productoViendo.precioBase || 0).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Información de disponibilidad */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Disponibilidad:</span>
                      {(productoViendo.stock || 0) === 0 ? (
                        <Badge className="bg-red-100 text-red-700 text-xs px-3 py-1">
                          Sin stock
                        </Badge>
                      ) : (productoViendo.stock || 0) <= 5 ? (
                        <Badge className="bg-orange-100 text-orange-700 text-xs px-3 py-1 flex items-center gap-1">
                          Pocas unidades
                          <ChevronDown className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 text-xs px-3 py-1">
                          En stock
                        </Badge>
                      )}
                    </div>
                    {(productoViendo.stock || 0) > 0 && (
                      <p className="text-xs text-gray-500">
                        {productoViendo.stock} {productoViendo.unidadMedida || 'unidad'}(es) disponible(s)
                      </p>
                    )}
                  </div>

                  {/* Especificaciones simplificadas */}
                  {(productoViendo.categoria || productoViendo.sku) && (
                    <div className="space-y-2 pt-2">
                      <h3 className="text-sm font-semibold text-gray-900">Especificaciones</h3>
                      <div className="space-y-2">
                        {productoViendo.categoria && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Categoría:</span>
                            <span className="text-gray-900 font-medium">{productoViendo.categoria}</span>
                          </div>
                        )}
                        {productoViendo.subcategoria && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subcategoría:</span>
                            <span className="text-gray-900 font-medium">{productoViendo.subcategoria}</span>
                          </div>
                        )}
                        {productoViendo.sku && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">SKU:</span>
                            <span className="text-gray-900 font-mono text-xs">{productoViendo.sku}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags si existen */}
                  {productoViendo.tags && productoViendo.tags.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-2">Etiquetas:</span>
                      <div className="flex flex-wrap gap-2">
                        {productoViendo.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Controles de cantidad y acciones */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
                    {/* Selector de cantidad */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          type="button"
                          onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          disabled={cantidad <= 1}
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
                          {cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCantidad(Math.min(productoViendo.stock || 999, cantidad + 1))}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          disabled={cantidad >= (productoViendo.stock || 999)}
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Botón de acción - pegado a la derecha */}
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        toast({
                          title: "Producto agregado",
                          description: `${cantidad} unidad(es) de "${productoViendo.nombre}" agregada(s) al carrito`,
                        })
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Agregar al Carrito
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay oscuro cuando el modal Órdenes está abierto */}
      {mostrarOrdenesProducto && (
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
          onClick={() => {
            setMostrarOrdenesProducto(false)
            setProductoOrdenes(null)
            setOrdenesDelProducto([])
            setBusquedaOrdenes("")
            setFiltroEstadoOrden("all")
          }}
        />
      )}

      {/* Modal Órdenes del Producto - Diseño mejorado */}
      {mostrarOrdenesProducto && productoOrdenes && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Órdenes del Producto
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {productoOrdenes.nombre}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMostrarOrdenesProducto(false)
                  setProductoOrdenes(null)
                  setOrdenesDelProducto([])
                  setBusquedaOrdenes("")
                  setFiltroEstadoOrden("all")
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6">
              {cargandoOrdenes ? (
                <LoadingSpinner texto="Cargando órdenes..." />
              ) : (
                <>
                  {/* Estadísticas */}
                  {ordenesDelProducto.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card className="border border-gray-200 rounded-lg">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Total Órdenes</p>
                              <p className="text-2xl font-bold text-gray-900">{ordenesDelProducto.length}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border border-gray-200 rounded-lg">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Cantidad Vendida</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {ordenesDelProducto.reduce((sum, orden) => sum + (orden.cantidadProducto || 0), 0)}
                              </p>
                            </div>
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border border-gray-200 rounded-lg">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Total Vendido</p>
                              <p className="text-2xl font-bold text-gray-900">
                                €{ordenesDelProducto.reduce((sum, orden) => sum + (orden.subtotalProducto || 0), 0).toFixed(2)}
                              </p>
                            </div>
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                              <DollarIcon className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border border-gray-200 rounded-lg">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Clientes Únicos</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {new Set(ordenesDelProducto.map(o => o.cliente?.email || o.cliente?.nombre || 'N/A')).size}
                              </p>
                            </div>
                            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                              <Users className="h-5 w-5 text-orange-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Filtros y búsqueda */}
                  {ordenesDelProducto.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar por cliente, número de orden..."
                            value={busquedaOrdenes}
                            onChange={(e) => setBusquedaOrdenes(e.target.value)}
                            className="pl-10 border-gray-300"
                          />
                        </div>
                      </div>
                      <Select value={filtroEstadoOrden} onValueChange={setFiltroEstadoOrden}>
                        <SelectTrigger className="w-full sm:w-48 border-gray-300">
                          <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="en_progreso">En Progreso</SelectItem>
                          <SelectItem value="revision">En Revisión</SelectItem>
                          <SelectItem value="completado">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Lista de órdenes */}
                  {ordenesDelProducto.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">No hay órdenes registradas</p>
                      <p className="text-sm text-gray-500">
                        Este producto aún no ha sido incluido en ninguna orden.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ordenesDelProducto
                        .filter((orden) => {
                          const matchBusqueda = !busquedaOrdenes || 
                            orden.numero?.toLowerCase().includes(busquedaOrdenes.toLowerCase()) ||
                            orden.cliente?.nombre?.toLowerCase().includes(busquedaOrdenes.toLowerCase()) ||
                            orden.cliente?.email?.toLowerCase().includes(busquedaOrdenes.toLowerCase())
                          const matchEstado = filtroEstadoOrden === "all" || orden.estado === filtroEstadoOrden
                          return matchBusqueda && matchEstado
                        })
                        .map((orden) => {
                          const obtenerColorEstado = (estado) => {
                            const colores = {
                              pendiente: "bg-gray-100 text-gray-800",
                              en_progreso: "bg-blue-100 text-blue-800",
                              revision: "bg-yellow-100 text-yellow-800",
                              completado: "bg-green-100 text-green-800",
                            }
                            return colores[estado] || "bg-gray-100 text-gray-800"
                          }

                          const obtenerIconoEstado = (estado) => {
                            const iconos = {
                              pendiente: Clock,
                              en_progreso: PlayCircle,
                              revision: AlertCircle,
                              completado: CheckCircle2,
                            }
                            return iconos[estado] || Clock
                          }

                          const IconoEstado = obtenerIconoEstado(orden.estado)
                          const fechaCreacion = orden.fechaCreacion?.toDate ? orden.fechaCreacion.toDate() : (orden.fechaCreacion ? new Date(orden.fechaCreacion) : null)

                          return (
                            <Card key={orden.id} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="font-semibold text-gray-900">{orden.numero || `Orden ${orden.id.substring(0, 8)}`}</h3>
                                      <Badge className={obtenerColorEstado(orden.estado)}>
                                        <IconoEstado className="h-3 w-3 mr-1" />
                                        {orden.estado?.replace('_', ' ') || 'Sin estado'}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                      <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">Cliente:</span>
                                        <span className="font-medium text-gray-900">
                                          {orden.cliente?.nombre || orden.cliente?.email || 'N/A'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <Package className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">Cantidad:</span>
                                        <span className="font-medium text-gray-900">{orden.cantidadProducto || 0}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <DollarIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium text-gray-900">€{(orden.subtotalProducto || 0).toFixed(2)}</span>
                                      </div>
                                      {fechaCreacion && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <Calendar className="h-4 w-4 text-gray-400" />
                                          <span className="text-gray-600">Fecha:</span>
                                          <span className="font-medium text-gray-900">
                                            {fechaCreacion.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay oscuro cuando el modal Eliminar está abierto */}
      {mostrarConfirmarEliminar && (
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
          onClick={() => {
            setMostrarConfirmarEliminar(false)
            setProductoAEliminar(null)
          }}
        />
      )}

      {/* Modal Confirmar Eliminar - Estilo similar a Ver Producto */}
      {mostrarConfirmarEliminar && productoAEliminar && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Icono principal - delete.svg grande y centrado */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                  <img 
                    src={deleteIcon} 
                    alt="Eliminar" 
                    className="w-16 h-16"
                    style={{
                      filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(7492%) hue-rotate(355deg) brightness(96%) contrast(118%)'
                    }}
                  />
                </div>
              </div>

              {/* Título */}
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¿Eliminar Producto?
                </h2>
                <p className="text-sm text-gray-600">
                  Esta acción eliminará el producto <strong className="text-gray-900">"{productoAEliminar.nombre}"</strong>. ¿Seguro de continuar?
                </p>
              </div>

              {/* Advertencias - estilo similar a Ver Producto */}
              {(productoAEliminar.stock > 0 || !productoAEliminar.activo) && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                  <div className="flex items-center justify-between">
                    {productoAEliminar.stock > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Stock actual:</span>
                        <Badge className="bg-orange-100 text-orange-700 text-xs px-3 py-1">
                          {productoAEliminar.stock} unidades
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Estado:</span>
                      <Badge className={`text-xs px-3 py-1 ${
                        productoAEliminar.activo 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {productoAEliminar.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones - estilo similar a Ver Producto */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setMostrarConfirmarEliminar(false)
                    setProductoAEliminar(null)
                  }}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white h-11"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmarEliminarProducto}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white h-11 font-medium shadow-sm"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


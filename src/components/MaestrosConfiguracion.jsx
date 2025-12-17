"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Package, 
  Ruler, 
  Tag, 
  Plus, 
  Edit, 
  Trash2,
  MoreVertical,
  DollarSign, 
  X,
  Save,
  Search,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { toast } from "../hooks/user-toast"

export function MaestrosConfiguracion() {
  const { tiendaActual } = useContextoTienda()
  const [mostrarMaestros, setMostrarMaestros] = useState(false)
  
  // Estados para cada maestro
  const [materiales, setMateriales] = useState([])
  const [acabados, setAcabados] = useState([])
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [unidadesMedida, setUnidadesMedida] = useState([])
  
  // Estados para edición
  const [editandoMaterial, setEditandoMaterial] = useState(null)
  const [editandoAcabado, setEditandoAcabado] = useState(null)
  const [editandoCategoria, setEditandoCategoria] = useState(null)
  const [editandoSubcategoria, setEditandoSubcategoria] = useState(null)
  const [editandoUnidad, setEditandoUnidad] = useState(null)
  
  // Formularios
  const [formMaterial, setFormMaterial] = useState({ name: "", pricePerUnit: "" })
  const [formAcabado, setFormAcabado] = useState({ name: "", priceModifier: "" })
  const [formCategoria, setFormCategoria] = useState({ nombre: "" })
  const [formSubcategoria, setFormSubcategoria] = useState({ nombre: "", categoria: "" })
  const [formUnidad, setFormUnidad] = useState({ nombre: "", simbolo: "" })
  
  const [cargando, setCargando] = useState(false)
  const [maestrosCargados, setMaestrosCargados] = useState(false)
  const [migracionCompleta, setMigracionCompleta] = useState(false)

  useEffect(() => {
    if (tiendaActual && !maestrosCargados) {
      cargarMaestros()
    }
  }, [tiendaActual, maestrosCargados])

  const cargarMaestros = async () => {
    try {
      setCargando(true)
      
      // Cargar materiales
      const materialesRef = collection(db, "tiendas", tiendaActual.id, "materiales")
      const materialesSnap = await getDocs(materialesRef)
      setMateriales(materialesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      
      // Cargar acabados
      const acabadosRef = collection(db, "tiendas", tiendaActual.id, "acabados")
      const acabadosSnap = await getDocs(acabadosRef)
      setAcabados(acabadosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      
      // Cargar categorías
      const categoriasRef = collection(db, "tiendas", tiendaActual.id, "categorias")
      const categoriasSnap = await getDocs(categoriasRef)
      setCategorias(categoriasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      
      // Cargar subcategorías
      const subcategoriasRef = collection(db, "tiendas", tiendaActual.id, "subcategorias")
      const subcategoriasSnap = await getDocs(subcategoriasRef)
      setSubcategorias(subcategoriasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      
      // Cargar unidades de medida
      const unidadesRef = collection(db, "tiendas", tiendaActual.id, "unidadesMedida")
      const unidadesSnap = await getDocs(unidadesRef)
      setUnidadesMedida(unidadesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      
      setMaestrosCargados(true)
    } catch (error) {
      console.error("Error cargando maestros:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los maestros",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  // Migrar datos mockeados a Firebase solo para tienda-demo
  const migrarDatosMockeados = async () => {
    try {
      // Verificar si ya existen datos antes de migrar
      const categoriasRef = collection(db, "tiendas", tiendaActual.id, "categorias")
      const categoriasSnap = await getDocs(categoriasRef)
      const categoriasExistentes = categoriasSnap.docs.map(doc => doc.data().nombre)

      const subcategoriasRef = collection(db, "tiendas", tiendaActual.id, "subcategorias")
      const subcategoriasSnap = await getDocs(subcategoriasRef)
      const subcategoriasExistentes = subcategoriasSnap.docs.length

      const unidadesRef = collection(db, "tiendas", tiendaActual.id, "unidadesMedida")
      const unidadesSnap = await getDocs(unidadesRef)
      const unidadesExistentes = unidadesSnap.docs.length

      // Datos mockeados que deben migrarse
      const categoriasMock = [
        "Señalética Exterior",
        "Señalética Interior",
        "Vinilos Decorativos",
        "Impresión Digital",
        "Letras Corpóreas",
        "Displays y Stands",
      ]

      const subcategoriasMock = {
        "Señalética Exterior": ["Tótems", "Vallas", "Banderolas", "Señales de Tráfico"],
        "Señalética Interior": ["Placas", "Directorios", "Señales de Seguridad", "Wayfinding"],
        "Vinilos Decorativos": ["Escaparates", "Paredes", "Vehículos", "Suelos"],
        "Impresión Digital": ["Lonas", "Canvas", "Papel", "Rígidos"],
        "Letras Corpóreas": ["Acero", "Acrílico", "PVC", "Madera"],
        "Displays y Stands": ["Roll-ups", "Photocalls", "Expositores", "Ferias"],
      }

      const unidadesMedidaMock = [
        { nombre: "unidad", simbolo: "unidad" },
        { nombre: "metro cuadrado", simbolo: "m²" },
        { nombre: "metro lineal", simbolo: "ml" },
        { nombre: "kilogramo", simbolo: "kg" },
        { nombre: "horas", simbolo: "horas" },
      ]

      // Migrar categorías si no existen
      if (categoriasExistentes.length === 0) {
        for (const catNombre of categoriasMock) {
          await addDoc(categoriasRef, {
            nombre: catNombre,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
          })
        }
      }

      // Migrar subcategorías si no existen
      if (subcategoriasExistentes === 0) {
        for (const [catNombre, subcats] of Object.entries(subcategoriasMock)) {
          for (const subcatNombre of subcats) {
            await addDoc(subcategoriasRef, {
              nombre: subcatNombre,
              categoria: catNombre,
              fechaCreacion: new Date(),
              fechaActualizacion: new Date(),
            })
          }
        }
      }

      // Migrar unidades de medida si no existen
      if (unidadesExistentes === 0) {
        for (const unidad of unidadesMedidaMock) {
          await addDoc(unidadesRef, {
            nombre: unidad.nombre,
            simbolo: unidad.simbolo,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
          })
        }
      }

      setMigracionCompleta(true)
      // Recargar maestros después de la migración
      await cargarMaestros()
    } catch (error) {
      console.error("Error migrando datos mockeados:", error)
    }
  }

  // Migrar datos mockeados a Firebase solo para tienda-demo
  useEffect(() => {
    if (tiendaActual && tiendaActual.id === "tienda-demo" && !migracionCompleta && maestrosCargados) {
      migrarDatosMockeados()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiendaActual, maestrosCargados, migracionCompleta])

  // Funciones para Materiales
  const guardarMaterial = async () => {
    try {
      const materialesRef = collection(db, "tiendas", tiendaActual.id, "materiales")
      const datos = {
        name: formMaterial.name,
        pricePerUnit: Number.parseFloat(formMaterial.pricePerUnit || 0),
        fechaCreacion: editandoMaterial ? undefined : new Date(),
        fechaActualizacion: new Date(),
      }
      
      if (editandoMaterial) {
        await updateDoc(doc(materialesRef, editandoMaterial.id), datos)
        toast({ title: "Material actualizado", description: "El material se ha actualizado correctamente" })
      } else {
        await addDoc(materialesRef, datos)
        toast({ title: "Material creado", description: "El material se ha creado correctamente" })
      }
      
      setFormMaterial({ name: "", pricePerUnit: "" })
      setEditandoMaterial(null)
      await cargarMaestros()
    } catch (error) {
      console.error("Error guardando material:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el material",
        variant: "destructive",
      })
    }
  }

  const eliminarMaterial = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este material?")) return
    try {
      await deleteDoc(doc(db, "tiendas", tiendaActual.id, "materiales", id))
      toast({ title: "Material eliminado", description: "El material se ha eliminado correctamente" })
      await cargarMaestros()
    } catch (error) {
      console.error("Error eliminando material:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el material",
        variant: "destructive",
      })
    }
  }

  // Funciones para Acabados
  const guardarAcabado = async () => {
    try {
      const acabadosRef = collection(db, "tiendas", tiendaActual.id, "acabados")
      const datos = {
        name: formAcabado.name,
        priceModifier: Number.parseFloat(formAcabado.priceModifier || 0),
        fechaCreacion: editandoAcabado ? undefined : new Date(),
        fechaActualizacion: new Date(),
      }
      
      if (editandoAcabado) {
        await updateDoc(doc(acabadosRef, editandoAcabado.id), datos)
        toast({ title: "Acabado actualizado", description: "El acabado se ha actualizado correctamente" })
      } else {
        await addDoc(acabadosRef, datos)
        toast({ title: "Acabado creado", description: "El acabado se ha creado correctamente" })
      }
      
      setFormAcabado({ name: "", priceModifier: "" })
      setEditandoAcabado(null)
      await cargarMaestros()
    } catch (error) {
      console.error("Error guardando acabado:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el acabado",
        variant: "destructive",
      })
    }
  }

  const eliminarAcabado = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este acabado?")) return
    try {
      await deleteDoc(doc(db, "tiendas", tiendaActual.id, "acabados", id))
      toast({ title: "Acabado eliminado", description: "El acabado se ha eliminado correctamente" })
      await cargarMaestros()
    } catch (error) {
      console.error("Error eliminando acabado:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el acabado",
        variant: "destructive",
      })
    }
  }

  // Funciones para Categorías
  const guardarCategoria = async () => {
    try {
      const categoriasRef = collection(db, "tiendas", tiendaActual.id, "categorias")
      const datos = {
        nombre: formCategoria.nombre,
        fechaCreacion: editandoCategoria ? undefined : new Date(),
        fechaActualizacion: new Date(),
      }
      
      if (editandoCategoria) {
        await updateDoc(doc(categoriasRef, editandoCategoria.id), datos)
        toast({ title: "Categoría actualizada", description: "La categoría se ha actualizado correctamente" })
      } else {
        await addDoc(categoriasRef, datos)
        toast({ title: "Categoría creada", description: "La categoría se ha creado correctamente" })
      }
      
      setFormCategoria({ nombre: "" })
      setEditandoCategoria(null)
      await cargarMaestros()
    } catch (error) {
      console.error("Error guardando categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la categoría",
        variant: "destructive",
      })
    }
  }

  const eliminarCategoria = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return
    try {
      await deleteDoc(doc(db, "tiendas", tiendaActual.id, "categorias", id))
      toast({ title: "Categoría eliminada", description: "La categoría se ha eliminado correctamente" })
      await cargarMaestros()
    } catch (error) {
      console.error("Error eliminando categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    }
  }

  // Funciones para Subcategorías
  const guardarSubcategoria = async () => {
    try {
      const subcategoriasRef = collection(db, "tiendas", tiendaActual.id, "subcategorias")
      const datos = {
        nombre: formSubcategoria.nombre,
        categoria: formSubcategoria.categoria,
        fechaCreacion: editandoSubcategoria ? undefined : new Date(),
        fechaActualizacion: new Date(),
      }
      
      if (editandoSubcategoria) {
        await updateDoc(doc(subcategoriasRef, editandoSubcategoria.id), datos)
        toast({ title: "Subcategoría actualizada", description: "La subcategoría se ha actualizado correctamente" })
      } else {
        await addDoc(subcategoriasRef, datos)
        toast({ title: "Subcategoría creada", description: "La subcategoría se ha creado correctamente" })
      }
      
      setFormSubcategoria({ nombre: "", categoria: "" })
      setEditandoSubcategoria(null)
      await cargarMaestros()
    } catch (error) {
      console.error("Error guardando subcategoría:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la subcategoría",
        variant: "destructive",
      })
    }
  }

  const eliminarSubcategoria = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta subcategoría?")) return
    try {
      await deleteDoc(doc(db, "tiendas", tiendaActual.id, "subcategorias", id))
      toast({ title: "Subcategoría eliminada", description: "La subcategoría se ha eliminado correctamente" })
      await cargarMaestros()
    } catch (error) {
      console.error("Error eliminando subcategoría:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la subcategoría",
        variant: "destructive",
      })
    }
  }

  // Funciones para Unidades de Medida
  const guardarUnidad = async () => {
    try {
      const unidadesRef = collection(db, "tiendas", tiendaActual.id, "unidadesMedida")
      const datos = {
        nombre: formUnidad.nombre,
        simbolo: formUnidad.simbolo,
        fechaCreacion: editandoUnidad ? undefined : new Date(),
        fechaActualizacion: new Date(),
      }
      
      if (editandoUnidad) {
        await updateDoc(doc(unidadesRef, editandoUnidad.id), datos)
        toast({ title: "Unidad actualizada", description: "La unidad se ha actualizado correctamente" })
      } else {
        await addDoc(unidadesRef, datos)
        toast({ title: "Unidad creada", description: "La unidad se ha creado correctamente" })
      }
      
      setFormUnidad({ nombre: "", simbolo: "" })
      setEditandoUnidad(null)
      await cargarMaestros()
    } catch (error) {
      console.error("Error guardando unidad:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la unidad",
        variant: "destructive",
      })
    }
  }

  const eliminarUnidad = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta unidad?")) return
    try {
      await deleteDoc(doc(db, "tiendas", tiendaActual.id, "unidadesMedida", id))
      toast({ title: "Unidad eliminada", description: "La unidad se ha eliminado correctamente" })
      await cargarMaestros()
    } catch (error) {
      console.error("Error eliminando unidad:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la unidad",
        variant: "destructive",
      })
    }
  }

  // Componente para sección de maestro
  const SeccionMaestro = ({ 
    titulo, 
    icono: Icono, 
    items, 
    form, 
    setForm, 
    editando, 
    setEditando,
    onGuardar, 
    onEliminar,
    campos,
    mostrarSeccion,
    setMostrarSeccion,
    categoriasDisponibles = [],
    obtenerColorItem = null // Función para obtener el color de cada item
  }) => {
    const [menuAbierto, setMenuAbierto] = useState(null)
    const [menuPosicion, setMenuPosicion] = useState({ top: 0, right: 0 })
    const menuRefs = useRef({})
    const [busqueda, setBusqueda] = useState("")
    const [ordenamiento, setOrdenamiento] = useState({ campo: null, direccion: 'asc' }) // 'asc' o 'desc'
    const inputRefs = useRef({})

    // Handler de cambio optimizado para evitar pérdida de foco
    const handleInputChange = (fieldName, value) => {
      setForm(prev => {
        // Solo actualizar si el valor realmente cambió
        if (prev[fieldName] === value) return prev
        return { ...prev, [fieldName]: value }
      })
    }

    // Cerrar menús al hacer clic fuera
    useEffect(() => {
      const handleClickOutside = (event) => {
        const menuAbiertoId = menuAbierto
        if (menuAbiertoId) {
          const ref = menuRefs.current[menuAbiertoId]
          const menuElement = document.querySelector(`[data-menu-id="${menuAbiertoId}"]`)
          if (ref && !ref.contains(event.target) && (!menuElement || !menuElement.contains(event.target))) {
            setMenuAbierto(null)
          }
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [menuAbierto])

    // Filtrar y ordenar items
    const itemsFiltradosYOrdenados = useMemo(() => {
      let itemsFiltrados = items

      // Filtrar por búsqueda (solo para Subcategorías)
      if (titulo === "Subcategorías" && busqueda.trim()) {
        const busquedaLower = busqueda.toLowerCase()
        itemsFiltrados = items.filter(item => {
          const nombre = (item.nombre || "").toLowerCase()
          const categoria = (item.categoria || "").toLowerCase()
          return nombre.includes(busquedaLower) || categoria.includes(busquedaLower)
        })
      }

      // Ordenar
      if (ordenamiento.campo) {
        itemsFiltrados = [...itemsFiltrados].sort((a, b) => {
          let valorA, valorB

          if (ordenamiento.campo === "nombre") {
            valorA = (a.nombre || a.name || "").toLowerCase()
            valorB = (b.nombre || b.name || "").toLowerCase()
          } else if (ordenamiento.campo === "categoria") {
            valorA = (a.categoria || "").toLowerCase()
            valorB = (b.categoria || "").toLowerCase()
          } else {
            valorA = a[ordenamiento.campo] || ""
            valorB = b[ordenamiento.campo] || ""
          }

          if (valorA < valorB) return ordenamiento.direccion === 'asc' ? -1 : 1
          if (valorA > valorB) return ordenamiento.direccion === 'asc' ? 1 : -1
          return 0
        })
      }

      return itemsFiltrados
    }, [items, busqueda, ordenamiento, titulo])

    // Función para manejar el ordenamiento
    const manejarOrdenamiento = (campo) => {
      if (ordenamiento.campo === campo) {
        // Si ya está ordenando por este campo, cambiar dirección
        setOrdenamiento({
          campo,
          direccion: ordenamiento.direccion === 'asc' ? 'desc' : 'asc'
        })
      } else {
        // Si es un campo nuevo, ordenar ascendente
        setOrdenamiento({
          campo,
          direccion: 'asc'
        })
      }
    }

    return (
      <div className="border border-gray-200 rounded-lg bg-white">
        <button
          onClick={() => setMostrarSeccion(!mostrarSeccion)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icono className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900">{titulo}</h4>
              <p className="text-xs text-gray-500">{items.length} {items.length === 1 ? 'registro' : 'registros'}</p>
            </div>
          </div>
          {mostrarSeccion ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {mostrarSeccion && (
          <div className="p-4 border-t border-gray-200 space-y-4">
            {/* Formulario */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border-0">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold text-gray-900">
                  {editando ? `Editar ${titulo}` : `Nuevo ${titulo}`}
                </h5>
                {editando && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditando(null)
                      setForm(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: "" }), {}))
                    }}
                    className="h-7 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancelar
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {campos.map((campo) => (
                  <div key={campo.name}>
                    <Label className="text-xs font-medium text-gray-700">{campo.label}</Label>
                    {campo.type === "select" ? (
                      <Select
                        value={form[campo.name] || ""}
                        onValueChange={(value) => handleInputChange(campo.name, value)}
                      >
                        <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder={campo.placeholder}>
                            {campo.name === "categoria" && categoriasDisponibles.length > 0
                              ? categoriasDisponibles.find(c => c.nombre === form[campo.name])?.nombre || form[campo.name] || ""
                              : form[campo.name] || ""}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {campo.name === "categoria" && categoriasDisponibles.length > 0
                            ? categoriasDisponibles.map((cat) => (
                                <SelectItem key={cat.id} value={cat.nombre}>
                                  {cat.nombre}
                                </SelectItem>
                              ))
                            : campo.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        key={`input-${campo.name}-${editando?.id || 'new'}`}
                        type={campo.type || "text"}
                        value={form[campo.name] || ""}
                        onChange={(e) => {
                          e.persist()
                          handleInputChange(campo.name, e.target.value)
                        }}
                        placeholder={campo.placeholder}
                        className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                onClick={onGuardar}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white h-9"
              >
                <Save className="w-3 h-3 mr-1" />
                {editando ? "Actualizar" : "Agregar"}
              </Button>
            </div>

            {/* Barra de búsqueda - solo para Subcategorías */}
            {titulo === "Subcategorías" && items.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o categoría..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                  />
                </div>
              </div>
            )}

            {/* Tabla de items */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              {items.length === 0 ? (
                <div className="text-center py-12 bg-white">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icono className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No hay registros</p>
                  <p className="text-xs text-gray-400 mt-1">Agrega tu primer {titulo.toLowerCase()} usando el formulario de arriba</p>
                </div>
              ) : itemsFiltradosYOrdenados.length === 0 ? (
                <div className="text-center py-12 bg-white">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No se encontraron resultados</p>
                  <p className="text-xs text-gray-400 mt-1">Intenta con otros términos de búsqueda</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            manejarOrdenamiento("nombre")
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          className="flex items-center gap-2 w-full text-left hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors focus:outline-none focus:ring-0"
                          style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
                        >
                          <span>Nombre</span>
                          {ordenamiento.campo === "nombre" && (
                            ordenamiento.direccion === 'asc' ? (
                              <ArrowUp className="h-3 w-3 text-gray-500" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-gray-500" />
                            )
                          )}
                        </button>
                      </th>
                      {campos.some(c => c.name === "pricePerUnit") && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                          Precio por Unidad
                        </th>
                      )}
                      {campos.some(c => c.name === "priceModifier") && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                          Modificador
                        </th>
                      )}
                      {campos.some(c => c.name === "simbolo") && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                          Símbolo
                        </th>
                      )}
                      {campos.some(c => c.name === "categoria") && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              manejarOrdenamiento("categoria")
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            className="flex items-center gap-2 w-full text-left hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors focus:outline-none focus:ring-0"
                            style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
                          >
                            <span>Categoría</span>
                            {ordenamiento.campo === "categoria" && (
                              ordenamiento.direccion === 'asc' ? (
                                <ArrowUp className="h-3 w-3 text-gray-500" />
                              ) : (
                                <ArrowDown className="h-3 w-3 text-gray-500" />
                              )
                            )}
                          </button>
                        </th>
                      )}
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {itemsFiltradosYOrdenados.map((item, index) => {
                      const colorItem = obtenerColorItem ? obtenerColorItem(item, index) : null
                      const bgColor = colorItem?.bg || 'bg-blue-100'
                      const textColor = colorItem?.text || 'text-blue-600'
                      const hoverColor = colorItem?.hover || 'hover:bg-blue-200'
                      
                      return (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0 ${hoverColor} transition-colors`}>
                              <Icono className={`w-5 h-5 ${textColor}`} />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-900 block">{item.name || item.nombre}</span>
                              {item.fechaCreacion && (
                                <span className="text-xs text-gray-400 mt-0.5">
                                  Creado {new Date(item.fechaCreacion?.seconds * 1000 || item.fechaCreacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        {campos.some(c => c.name === "pricePerUnit") && (
                          <td className="px-4 py-4">
                            {item.pricePerUnit !== undefined ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200 font-medium">
                                  <DollarSign className="w-3 h-3 mr-1 inline" />
                                  €{Number(item.pricePerUnit).toFixed(2)}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                        )}
                        {campos.some(c => c.name === "priceModifier") && (
                          <td className="px-4 py-4">
                            {item.priceModifier !== undefined ? (
                              <Badge variant="secondary" className={`text-xs font-medium ${
                                Number(item.priceModifier) > 0 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                  : Number(item.priceModifier) < 0
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-gray-50 text-gray-700 border-gray-200'
                              }`}>
                                {Number(item.priceModifier) > 0 ? '+' : ''}{item.priceModifier}%
                              </Badge>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                        )}
                        {campos.some(c => c.name === "simbolo") && (
                          <td className="px-4 py-4">
                            {item.simbolo ? (
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200 font-mono">
                                {item.simbolo}
                              </Badge>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                        )}
                        {campos.some(c => c.name === "categoria") && (
                          <td className="px-4 py-4">
                            {item.categoria ? (() => {
                              const colorCategoria = obtenerColorCategoria(item.categoria)
                              return (
                                <Badge variant="secondary" className={`text-xs ${colorCategoria.badge}`}>
                                  {item.categoria}
                                </Badge>
                              )
                            })() : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                        )}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end">
                            <div className="relative" ref={(el) => { if (el) menuRefs.current[item.id] = el }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const rect = menuRefs.current[item.id]?.getBoundingClientRect()
                                  if (rect) {
                                    setMenuPosicion({
                                      top: rect.bottom + 8,
                                      right: window.innerWidth - rect.right
                                    })
                                  }
                                  setMenuAbierto(menuAbierto === item.id ? null : item.id)
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                className="p-1.5 hover:bg-gray-100 rounded transition-colors group-hover:bg-gray-100 focus:outline-none focus:ring-0"
                              >
                                <MoreVertical className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                              </button>
                              {menuAbierto === item.id && (
                                <div 
                                  data-menu-id={item.id}
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
                                      setEditando(item)
                                      setForm(item)
                                      setMenuAbierto(null)
                                    }}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors focus:outline-none focus:ring-0"
                                  >
                                    <Edit className="h-4 w-4 text-gray-500" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      onEliminar(item.id)
                                      setMenuAbierto(null)
                                    }}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors focus:outline-none focus:ring-0"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const [mostrarMateriales, setMostrarMateriales] = useState(false)
  const [mostrarAcabados, setMostrarAcabados] = useState(false)
  const [mostrarCategorias, setMostrarCategorias] = useState(false)
  const [mostrarSubcategorias, setMostrarSubcategorias] = useState(false)
  const [mostrarUnidades, setMostrarUnidades] = useState(false)

  // Colores para categorías
  const coloresCategorias = [
    { bg: 'bg-blue-100', text: 'text-blue-600', hover: 'hover:bg-blue-200', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { bg: 'bg-purple-100', text: 'text-purple-600', hover: 'hover:bg-purple-200', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    { bg: 'bg-pink-100', text: 'text-pink-600', hover: 'hover:bg-pink-200', badge: 'bg-pink-50 text-pink-700 border-pink-200' },
    { bg: 'bg-indigo-100', text: 'text-indigo-600', hover: 'hover:bg-indigo-200', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { bg: 'bg-teal-100', text: 'text-teal-600', hover: 'hover:bg-teal-200', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
    { bg: 'bg-orange-100', text: 'text-orange-600', hover: 'hover:bg-orange-200', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-600', hover: 'hover:bg-cyan-200', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { bg: 'bg-rose-100', text: 'text-rose-600', hover: 'hover:bg-rose-200', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  ]

  // Función para obtener el color de una categoría
  const obtenerColorCategoria = (nombreCategoria) => {
    if (!nombreCategoria) return coloresCategorias[0]
    const index = categorias.findIndex(cat => cat.nombre === nombreCategoria)
    return coloresCategorias[index % coloresCategorias.length] || coloresCategorias[0]
  }

  // Función para obtener el color de una categoría por índice
  const obtenerColorCategoriaPorIndice = (index) => {
    return coloresCategorias[index % coloresCategorias.length] || coloresCategorias[0]
  }

  return (
    <div className="space-y-4">
      {/* Header desplegable */}
      <button
        onClick={() => setMostrarMaestros(!mostrarMaestros)}
        className="w-full flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Maestros de Configuración</h3>
            <p className="text-xs text-gray-500">Gestiona materiales, acabados, categorías y más</p>
          </div>
        </div>
        {mostrarMaestros ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Contenido desplegable */}
      {mostrarMaestros && (
        <div className="space-y-4 pt-2">
          {cargando && !maestrosCargados ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Cargando maestros...</p>
            </div>
          ) : (
            <>
              <SeccionMaestro
                titulo="Materiales"
                icono={Package}
                items={materiales}
                form={formMaterial}
                setForm={setFormMaterial}
                editando={editandoMaterial}
                setEditando={setEditandoMaterial}
                onGuardar={guardarMaterial}
                onEliminar={eliminarMaterial}
                campos={[
                  { name: "name", label: "Nombre", placeholder: "Ej: Acero, PVC, Madera" },
                  { name: "pricePerUnit", label: "Precio por Unidad (€)", type: "number", placeholder: "0.00" }
                ]}
                mostrarSeccion={mostrarMateriales}
                setMostrarSeccion={setMostrarMateriales}
              />

              <SeccionMaestro
                titulo="Acabados"
                icono={Tag}
                items={acabados}
                form={formAcabado}
                setForm={setFormAcabado}
                editando={editandoAcabado}
                setEditando={setEditandoAcabado}
                onGuardar={guardarAcabado}
                onEliminar={eliminarAcabado}
                campos={[
                  { name: "name", label: "Nombre", placeholder: "Ej: Mate, Brillo, Texturizado" },
                  { name: "priceModifier", label: "Modificador de Precio (%)", type: "number", placeholder: "0" }
                ]}
                mostrarSeccion={mostrarAcabados}
                setMostrarSeccion={setMostrarAcabados}
              />

              <SeccionMaestro
                titulo="Categorías"
                icono={Layers}
                items={categorias}
                form={formCategoria}
                setForm={setFormCategoria}
                editando={editandoCategoria}
                setEditando={setEditandoCategoria}
                onGuardar={guardarCategoria}
                onEliminar={eliminarCategoria}
                campos={[
                  { name: "nombre", label: "Nombre", placeholder: "Ej: Señalética Exterior" }
                ]}
                mostrarSeccion={mostrarCategorias}
                setMostrarSeccion={setMostrarCategorias}
                obtenerColorItem={(item, index) => obtenerColorCategoriaPorIndice(index)}
              />

              <SeccionMaestro
                titulo="Subcategorías"
                icono={Layers}
                items={subcategorias}
                form={formSubcategoria}
                setForm={setFormSubcategoria}
                editando={editandoSubcategoria}
                setEditando={setEditandoSubcategoria}
                onGuardar={guardarSubcategoria}
                onEliminar={eliminarSubcategoria}
                categoriasDisponibles={categorias}
                campos={[
                  { name: "nombre", label: "Nombre", placeholder: "Ej: Tótems, Vallas" },
                  { 
                    name: "categoria", 
                    label: "Categoría", 
                    type: "select",
                    placeholder: "Seleccionar categoría"
                  }
                ]}
                mostrarSeccion={mostrarSubcategorias}
                setMostrarSeccion={setMostrarSubcategorias}
                obtenerColorItem={(item) => {
                  // Si la subcategoría tiene una categoría, usar su color
                  if (item.categoria) {
                    return obtenerColorCategoria(item.categoria)
                  }
                  return null // Usar color por defecto
                }}
              />

              <SeccionMaestro
                titulo="Unidades de Medida"
                icono={Ruler}
                items={unidadesMedida}
                form={formUnidad}
                setForm={setFormUnidad}
                editando={editandoUnidad}
                setEditando={setEditandoUnidad}
                onGuardar={guardarUnidad}
                onEliminar={eliminarUnidad}
                campos={[
                  { name: "nombre", label: "Nombre", placeholder: "Ej: Metro cuadrado, Unidad" },
                  { name: "simbolo", label: "Símbolo", placeholder: "Ej: m², unidad" }
                ]}
                mostrarSeccion={mostrarUnidades}
                setMostrarSeccion={setMostrarUnidades}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}


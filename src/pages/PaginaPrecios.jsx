"use client"

import { useState, useEffect, useRef } from "react"
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { CalculadoraPrecios } from "../components/CalculadoraPrecios"
import { Plus, DollarSign, Trash2, Percent, Tag, Edit, Power, PowerOff, X, Layers, FileText, Package, Hash } from "lucide-react"
import { toast } from "../hooks/user-toast"

export function PaginaPrecios() {
  const { tiendaActual } = useContextoTienda()
  const [productos, setProductos] = useState([])
  const [reglasPrecio, setReglasPrecio] = useState([])
  const [materiales, setMateriales] = useState([])
  const [acabados, setAcabados] = useState([])
  const [mostrarSidebar, setMostrarSidebar] = useState(false)
  const [reglaEditando, setReglaEditando] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const precioChartRef = useRef(null)

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    tipoRegla: "cantidad", // cantidad, superficie, material, acabado
    condicion: "mayor_que", // mayor_que, menor_que, igual_a, entre
    valor1: "",
    valor2: "",
    tipoDescuento: "porcentaje", // porcentaje, fijo
    descuento: "",
    productoId: "",
    activa: true,
  })

  const tiposRegla = [
    { value: "cantidad", label: "Cantidad" },
    { value: "superficie", label: "Superficie" },
    { value: "material", label: "Material" },
    { value: "acabado", label: "Acabado" },
  ]

  // Función helper para capitalizar
  const capitalizar = (str) => {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const condiciones = [
    { value: "mayor_que", label: "Mayor que >" },
    { value: "menor_que", label: "Menor que <" },
    { value: "igual_a", label: "Igual a =" },
    { value: "entre", label: "Entre" },
  ]

  const tiposDescuento = [
    { value: "porcentaje", label: "Porcentaje (%)" },
    { value: "fijo", label: "Cantidad Fija (€)" },
  ]

  useEffect(() => {
    if (tiendaActual) {
      cargarDatos()
    }
  }, [tiendaActual])

  const cargarDatos = async () => {
    try {
      setCargando(true)

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

      const materialesRef = collection(db, "tiendas", tiendaActual.id, "materiales")
      const materialesSnapshot = await getDocs(materialesRef)
      const materialesData = materialesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setMateriales(materialesData)

      const acabadosRef = collection(db, "tiendas", tiendaActual.id, "acabados")
      const acabadosSnapshot = await getDocs(acabadosRef)
      const acabadosData = acabadosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setAcabados(acabadosData)
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setCargando(false)
    }
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()
    try {
      setCargando(true)
      const reglasRef = collection(db, "tiendas", tiendaActual.id, "reglasPrecio")

      const datosRegla = {
        ...formulario,
        valor1: Number.parseFloat(formulario.valor1),
        valor2: formulario.valor2 ? Number.parseFloat(formulario.valor2) : null,
        descuento: Number.parseFloat(formulario.descuento),
        fechaCreacion: reglaEditando ? reglaEditando.fechaCreacion : new Date(),
        fechaActualizacion: new Date(),
      }

      if (reglaEditando) {
        // Editar regla existente
        await updateDoc(doc(db, "tiendas", tiendaActual.id, "reglasPrecio", reglaEditando.id), datosRegla)
        toast({
          title: "Regla de precio actualizada",
          description: "La regla de precio se ha actualizado exitosamente",
        })
      } else {
        // Crear nueva regla
      await addDoc(reglasRef, datosRegla)
        toast({
          title: "Regla de precio creada",
          description: "La regla de precio se ha creado exitosamente",
        })
      }

      await cargarDatos()
      setMostrarSidebar(false)
      resetearFormulario()
    } catch (error) {
      console.error("Error guardando regla:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la regla. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const eliminarRegla = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta regla? Esta acción no se puede deshacer.")) {
      return
    }

      try {
        await deleteDoc(doc(db, "tiendas", tiendaActual.id, "reglasPrecio", id))
        await cargarDatos()
      toast({
        title: "Regla eliminada",
        description: "La regla de precio se ha eliminado correctamente",
      })
      } catch (error) {
        console.error("Error eliminando regla:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la regla. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const resetearFormulario = () => {
    setFormulario({
      nombre: "",
      descripcion: "",
      tipoRegla: "cantidad",
      condicion: "mayor_que",
      valor1: "",
      valor2: "",
      tipoDescuento: "porcentaje",
      descuento: "",
      productoId: "",
      activa: true,
    })
    setReglaEditando(null)
    setMostrarSidebar(false)
  }

  const editarRegla = (regla) => {
    setReglaEditando(regla)
    setFormulario({
      nombre: regla.nombre || "",
      descripcion: regla.descripcion || "",
      tipoRegla: regla.tipoRegla || "cantidad",
      condicion: regla.condicion || "mayor_que",
      valor1: regla.valor1?.toString() || "",
      valor2: regla.valor2?.toString() || "",
      tipoDescuento: regla.tipoDescuento || "porcentaje",
      descuento: regla.descuento?.toString() || "",
      productoId: regla.productoId || "",
      activa: regla.activa !== undefined ? regla.activa : true,
    })
    setMostrarSidebar(true)
  }

  const toggleActivarRegla = async (regla) => {
    try {
      await updateDoc(doc(db, "tiendas", tiendaActual.id, "reglasPrecio", regla.id), {
        activa: !regla.activa,
        fechaActualizacion: new Date(),
      })
      await cargarDatos()
      toast({
        title: regla.activa ? "Regla desactivada" : "Regla activada",
        description: `La regla "${regla.nombre}" ha sido ${regla.activa ? "desactivada" : "activada"}`,
      })
    } catch (error) {
      console.error("Error actualizando regla:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la regla. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }


  return (
    <div className="space-y-6 min-h-full px-18">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Gestión de Precios</h1>
          <p className="text-sm text-gray-600 mt-1 leading-tight">Configura reglas de precios y descuentos</p>
        </div>
        <Button 
          onClick={() => {
            setReglaEditando(null)
            resetearFormulario()
            setMostrarSidebar(true)
          }} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Regla de Precio
        </Button>
      </div>

      {/* Calculadora de Precios */}
        <CalculadoraPrecios
          productos={productos}
          reglasPrecio={reglasPrecio}
          materiales={materiales}
          acabados={acabados}
        />

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
            setReglaEditando(null)
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
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {reglaEditando ? "Editar Regla de Precio" : "Nueva Regla de Precio"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {reglaEditando ? "Modifica la información de la regla" : "Completa la información de la regla"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMostrarSidebar(false)
                  setReglaEditando(null)
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
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    Nombre de la Regla <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre-sidebar"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    placeholder="Ingresa el nombre de la regla"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    Descripción (opcional)
                  </Label>
                  <Textarea
                    id="descripcion-sidebar"
                    value={formulario.descripcion}
                    onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                    placeholder="Describe la regla de precio..."
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px] resize-y"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="productoId-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-gray-400" />
                    Producto (opcional)
                  </Label>
                  <Select
                    value={formulario.productoId || "all"}
                    onValueChange={(value) =>
                      setFormulario({ ...formulario, productoId: value === "all" ? "" : value })
                    }
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full">
                      <SelectValue>
                        {formulario.productoId === "" || formulario.productoId === "all" 
                          ? "Todos los productos" 
                          : productos.find(p => p.id === formulario.productoId)?.nombre || "Todos los productos"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-[102]">
                      <SelectItem value="all" className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm">
                        Todos los productos
                      </SelectItem>
                      {productos.map((producto) => (
                        <SelectItem 
                          key={producto.id} 
                          value={producto.id}
                          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm"
                        >
                          {producto.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sección: Tipo y Condición */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Percent className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tipo y Condición</h3>
                </div>

                <div>
                  <Label htmlFor="tipoRegla-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-gray-400" />
                    Tipo de Regla <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formulario.tipoRegla}
                    onValueChange={(value) => {
                      setFormulario({ 
                        ...formulario, 
                        tipoRegla: value,
                        valor1: "",
                        valor2: "",
                        condicion: value === "material" || value === "acabado" ? "igual_a" : formulario.condicion
                      })
                    }}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full">
                      <SelectValue>
                        {tiposRegla.find(t => t.value === formulario.tipoRegla)?.label || formulario.tipoRegla}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-[102]">
                      {tiposRegla.map((tipo) => (
                        <SelectItem 
                          key={tipo.value} 
                          value={tipo.value}
                          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm"
                        >
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formulario.tipoRegla === "material" && (
                  <div>
                    <Label htmlFor="materialId-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-gray-400" />
                      Material <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formulario.valor1 || ""}
                      onValueChange={(value) => setFormulario({ ...formulario, valor1: value })}
                      required
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full">
                        <SelectValue placeholder="Seleccionar material" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-[102]">
                        {materiales.map((material) => (
                          <SelectItem 
                            key={material.id} 
                            value={material.id}
                            className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm"
                          >
                            {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formulario.tipoRegla === "acabado" && (
                  <div>
                    <Label htmlFor="acabadoId-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-gray-400" />
                      Acabado <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formulario.valor1 || ""}
                      onValueChange={(value) => setFormulario({ ...formulario, valor1: value })}
                      required
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full">
                        <SelectValue placeholder="Seleccionar acabado" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-[102]">
                        {acabados.map((acabado) => (
                          <SelectItem 
                            key={acabado.id} 
                            value={acabado.id}
                            className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm"
                          >
                            {acabado.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formulario.tipoRegla !== "material" && formulario.tipoRegla !== "acabado" && (
                  <>
                <div>
                      <Label htmlFor="condicion-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <Percent className="h-3.5 w-3.5 text-gray-400" />
                        Condición <span className="text-red-500">*</span>
                      </Label>
                  <Select
                    value={formulario.condicion}
                    onValueChange={(value) => setFormulario({ ...formulario, condicion: value })}
                  >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full">
                        <SelectValue>
                          {condiciones.find(c => c.value === formulario.condicion)?.label || capitalizar(formulario.condicion)}
                        </SelectValue>
                    </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-[102]">
                      {condiciones.map((cond) => (
                          <SelectItem 
                            key={cond.value} 
                            value={cond.value}
                            className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm"
                          >
                          {cond.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                      <Label htmlFor="valor1-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-gray-400" />
                        Valor <span className="text-red-500">*</span>
                      </Label>
                  <Input
                        id="valor1-sidebar"
                    type="number"
                    step="0.01"
                    value={formulario.valor1}
                    onChange={(e) => setFormulario({ ...formulario, valor1: e.target.value })}
                        placeholder="0.00"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {formulario.condicion === "entre" && (
                  <div>
                        <Label htmlFor="valor2-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5 text-gray-400" />
                          Valor Máximo <span className="text-red-500">*</span>
                        </Label>
                    <Input
                          id="valor2-sidebar"
                      type="number"
                      step="0.01"
                      value={formulario.valor2}
                      onChange={(e) => setFormulario({ ...formulario, valor2: e.target.value })}
                          placeholder="0.00"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                    )}
                  </>
                )}
              </div>

              {/* Sección: Descuento */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Descuento</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="tipoDescuento-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Tipo de Descuento <span className="text-red-500">*</span>
                    </Label>
                  <Select
                    value={formulario.tipoDescuento}
                    onValueChange={(value) => setFormulario({ ...formulario, tipoDescuento: value })}
                  >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full">
                        <SelectValue>
                          {tiposDescuento.find(t => t.value === formulario.tipoDescuento)?.label || capitalizar(formulario.tipoDescuento)}
                        </SelectValue>
                    </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-[102]">
                        {tiposDescuento.map((tipo) => (
                          <SelectItem 
                            key={tipo.value} 
                            value={tipo.value}
                            className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-sm"
                          >
                            {tipo.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                    <Label htmlFor="descuento-sidebar" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Descuento {formulario.tipoDescuento === "porcentaje" ? "(%)" : "(€)"} <span className="text-red-500">*</span>
                  </Label>
                    <div className="relative">
                      {formulario.tipoDescuento === "porcentaje" ? (
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                      ) : (
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                      )}
                  <Input
                        id="descuento-sidebar"
                    type="number"
                    step="0.01"
                    value={formulario.descuento}
                    onChange={(e) => setFormulario({ ...formulario, descuento: e.target.value })}
                        placeholder="0.00"
                        className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${formulario.tipoDescuento === "porcentaje" ? "pr-8" : "pl-8"}`}
                    required
                  />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setMostrarSidebar(false)
                    setReglaEditando(null)
                    resetearFormulario()
                  }}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-11"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={cargando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11"
                >
                  {cargando ? (reglaEditando ? "Actualizando..." : "Guardando...") : (reglaEditando ? "Actualizar Regla" : "Guardar Regla")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reglas de Precio */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Reglas de Precio Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reglasPrecio.map((regla) => (
                <div 
                  key={regla.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Tag className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight">{regla.nombre}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                            {tiposRegla.find((t) => t.value === regla.tipoRegla)?.label}
                          </Badge>
                          {regla.activa ? (
                            <Badge className="text-xs bg-green-100 text-green-700">Activa</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">Inactiva</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => toggleActivarRegla(regla)}
                        className={`${regla.activa ? 'border-orange-300 text-orange-700 hover:bg-orange-50' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
                        title={regla.activa ? "Desactivar regla" : "Activar regla"}
                      >
                        {regla.activa ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => editarRegla(regla)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        title="Editar regla"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => eliminarRegla(regla.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        title="Eliminar regla"
                      >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    {regla.descripcion && (
                      <p className="text-gray-500 italic text-xs mb-2">{regla.descripcion}</p>
                    )}
                    <p className="text-gray-600">
                      <span className="font-medium">Condición:</span> {
                        regla.tipoRegla === "material" || regla.tipoRegla === "acabado" 
                          ? `Igual a ${regla.tipoRegla === "material" 
                              ? materiales.find(m => m.id === regla.valor1)?.name || regla.valor1
                              : acabados.find(a => a.id === regla.valor1)?.name || regla.valor1}`
                          : `${condiciones.find((c) => c.value === regla.condicion)?.label} ${regla.valor1}${regla.valor2 ? ` y ${regla.valor2}` : ""}`
                      }
                    </p>
                    <p className="text-gray-900 font-semibold">
                      <span className="text-gray-600 font-normal">Descuento:</span> {regla.descuento}
                    {regla.tipoDescuento === "porcentaje" ? "%" : "€"}
                  </p>
                  </div>
                </div>
              ))}
              {reglasPrecio.length === 0 && (
                <div className="text-center py-8">
                  <Tag className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No hay reglas de precio configuradas</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Estadísticas de Precios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="text-center p-4 rounded-lg border-0 shadow-md"
                  style={{ backgroundColor: "rgb(253, 151, 34)" }}
                >
                  <DollarSign className="h-6 w-6 text-white mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white leading-tight">{productos.length}</div>
                  <div className="text-sm text-white/90 leading-tight">Productos</div>
                </div>
                <div 
                  className="text-center p-4 rounded-lg border-0 shadow-md"
                  style={{ backgroundColor: "rgb(242, 66, 110)" }}
                >
                  <Percent className="h-6 w-6 text-white mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white leading-tight">{reglasPrecio.length}</div>
                  <div className="text-sm text-white/90 leading-tight">Reglas Activas</div>
                </div>
              </div>

              {productos.length > 0 && (
                <div className="space-y-4 mt-4">
                  <h4 className="font-medium text-gray-900">Rango de Precios</h4>
                  <div className="relative h-40 bg-gray-50 rounded-lg p-4" ref={precioChartRef}>
                    <svg width="100%" height="100%" viewBox="0 0 400 140" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
                      <defs>
                        <linearGradient id="precioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgb(5, 142, 252)" stopOpacity="0.2" />
                          <stop offset="50%" stopColor="rgb(5, 142, 252)" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="rgb(5, 142, 252)" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const minimo = Math.min(...productos.map((p) => p.precioBase))
                        const maximo = Math.max(...productos.map((p) => p.precioBase))
                        const promedio = productos.reduce((sum, p) => sum + p.precioBase, 0) / productos.length
                        const rango = maximo - minimo
                        const posMin = 40
                        const posMax = 360
                        const posProm = rango > 0 ? posMin + ((promedio - minimo) / rango) * (posMax - posMin) : (posMin + posMax) / 2
                        const alturaBase = 120
                        const alturaMin = alturaBase - 20
                        const alturaMax = alturaBase - 20
                        const alturaProm = alturaBase - 50
                        
                        return (
                          <>
                            {/* Área sombreada */}
                            <polygon
                              points={`${posMin},${alturaBase} ${posMin},${alturaMin} ${posProm},${alturaProm} ${posMax},${alturaMax} ${posMax},${alturaBase}`}
                              fill="url(#precioGradient)"
                            />
                            {/* Línea principal */}
                            <polyline
                              points={`${posMin},${alturaMin} ${posProm},${alturaProm} ${posMax},${alturaMax}`}
                              fill="none"
                              stroke="rgb(5, 142, 252)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {/* Punto Mínimo */}
                            <circle
                              cx={posMin}
                              cy={alturaMin}
                              r="6"
                              fill="rgb(5, 142, 252)"
                              className="hover:r-8 transition-all cursor-pointer"
                              onMouseEnter={(e) => {
                                const chartContainer = precioChartRef.current
                                if (chartContainer) {
                                  const rect = chartContainer.getBoundingClientRect()
                                  const svgRect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
                                  setTooltip({
                                    x: e.clientX - rect.left,
                                    y: e.clientY - rect.top,
                                    text: `Mínimo: €${minimo.toFixed(2)}`,
                                  })
                                }
                              }}
                              onMouseLeave={() => setTooltip(null)}
                            />
                            <text
                              x={posMin}
                              y={alturaBase + 10}
                              textAnchor="middle"
                              className="text-xs fill-gray-700 font-medium"
                            >
                              Min
                            </text>
                            {/* Punto Promedio */}
                            <circle
                              cx={posProm}
                              cy={alturaProm}
                              r="6"
                              fill="rgb(5, 142, 252)"
                              className="hover:r-8 transition-all cursor-pointer"
                              onMouseEnter={(e) => {
                                const chartContainer = precioChartRef.current
                                if (chartContainer) {
                                  const rect = chartContainer.getBoundingClientRect()
                                  setTooltip({
                                    x: e.clientX - rect.left,
                                    y: e.clientY - rect.top,
                                    text: `Promedio: €${promedio.toFixed(2)}`,
                                  })
                                }
                              }}
                              onMouseLeave={() => setTooltip(null)}
                            />
                            <text
                              x={posProm}
                              y={alturaBase + 10}
                              textAnchor="middle"
                              className="text-xs fill-gray-700 font-medium"
                            >
                              Prom
                            </text>
                            {/* Punto Máximo */}
                            <circle
                              cx={posMax}
                              cy={alturaMax}
                              r="6"
                              fill="rgb(5, 142, 252)"
                              className="hover:r-8 transition-all cursor-pointer"
                              onMouseEnter={(e) => {
                                const chartContainer = precioChartRef.current
                                if (chartContainer) {
                                  const rect = chartContainer.getBoundingClientRect()
                                  setTooltip({
                                    x: e.clientX - rect.left,
                                    y: e.clientY - rect.top,
                                    text: `Máximo: €${maximo.toFixed(2)}`,
                                  })
                                }
                              }}
                              onMouseLeave={() => setTooltip(null)}
                            />
                            <text
                              x={posMax}
                              y={alturaBase + 10}
                              textAnchor="middle"
                              className="text-xs fill-gray-700 font-medium"
                            >
                              Max
                            </text>
                          </>
                        )
                      })()}
                    </svg>
                    {/* Tooltip */}
                    {tooltip && (
                      <div
                        className="absolute bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50 pointer-events-none whitespace-nowrap"
                        style={{
                          left: `${tooltip.x}px`,
                          top: `${tooltip.y}px`,
                          transform: 'translate(-50%, -100%)',
                          marginTop: '-8px'
                        }}
                      >
                        <div>{tooltip.text}</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">€{Math.min(...productos.map((p) => p.precioBase)).toFixed(2)}</div>
                      <div className="text-gray-600">Mínimo</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">€{(productos.reduce((sum, p) => sum + p.precioBase, 0) / productos.length).toFixed(2)}</div>
                      <div className="text-gray-600">Promedio</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">€{Math.max(...productos.map((p) => p.precioBase)).toFixed(2)}</div>
                      <div className="text-gray-600">Máximo</div>
                  </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

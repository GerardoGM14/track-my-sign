"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { CalculadoraPrecios } from "../components/CalculadoraPrecios"

export function PaginaPrecios() {
  const { tiendaActual } = useContextoTienda()
  const [productos, setProductos] = useState([])
  const [reglasPrecio, setReglasPrecio] = useState([])
  const [materiales, setMateriales] = useState([])
  const [acabados, setAcabados] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cargando, setCargando] = useState(false)

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
    { value: "cantidad", label: "Por Cantidad" },
    { value: "superficie", label: "Por Superficie (m²)" },
    { value: "material", label: "Por Material" },
    { value: "acabado", label: "Por Acabado" },
  ]

  const condiciones = [
    { value: "mayor_que", label: "Mayor que" },
    { value: "menor_que", label: "Menor que" },
    { value: "igual_a", label: "Igual a" },
    { value: "entre", label: "Entre" },
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
        fechaCreacion: new Date(),
      }

      await addDoc(reglasRef, datosRegla)
      await cargarDatos()
      resetearFormulario()
    } catch (error) {
      console.error("Error guardando regla:", error)
    } finally {
      setCargando(false)
    }
  }

  const eliminarRegla = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta regla?")) {
      try {
        await deleteDoc(doc(db, "tiendas", tiendaActual.id, "reglasPrecio", id))
        await cargarDatos()
      } catch (error) {
        console.error("Error eliminando regla:", error)
      }
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
    setMostrarFormulario(false)
  }

  const calcularPrecioConReglas = (producto, cantidad = 1, superficie = 0) => {
    let precioFinal = producto.precioBase

    // Aplicar reglas de precio
    const reglasAplicables = reglasPrecio.filter(
      (regla) => regla.activa && (regla.productoId === "" || regla.productoId === producto.id),
    )

    reglasAplicables.forEach((regla) => {
      let aplicarRegla = false

      switch (regla.tipoRegla) {
        case "cantidad":
          if (regla.condicion === "mayor_que" && cantidad > regla.valor1) aplicarRegla = true
          if (regla.condicion === "menor_que" && cantidad < regla.valor1) aplicarRegla = true
          if (regla.condicion === "igual_a" && cantidad === regla.valor1) aplicarRegla = true
          if (regla.condicion === "entre" && cantidad >= regla.valor1 && cantidad <= regla.valor2) aplicarRegla = true
          break
        case "superficie":
          if (regla.condicion === "mayor_que" && superficie > regla.valor1) aplicarRegla = true
          if (regla.condicion === "menor_que" && superficie < regla.valor1) aplicarRegla = true
          break
        case "material":
          if (regla.condicion === "igual_a" && producto.material === regla.valor1) aplicarRegla = true
          break
        case "acabado":
          if (regla.condicion === "igual_a" && producto.acabado === regla.valor1) aplicarRegla = true
          break
      }

      if (aplicarRegla) {
        if (regla.tipoDescuento === "porcentaje") {
          precioFinal = precioFinal * (1 - regla.descuento / 100)
        } else {
          precioFinal = precioFinal - regla.descuento
        }
      }
    })

    return Math.max(0, precioFinal)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Precios</h1>
        <Button onClick={() => setMostrarFormulario(true)}>Nueva Regla de Precio</Button>
      </div>

      <div className="mb-8">
        <CalculadoraPrecios
          productos={productos}
          reglasPrecio={reglasPrecio}
          materiales={materiales}
          acabados={acabados}
        />
      </div>

      {mostrarFormulario && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nueva Regla de Precio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={manejarSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre de la Regla</Label>
                  <Input
                    id="nombre"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="productoId">Producto (opcional)</Label>
                  <Select
                    value={formulario.productoId || "all"}
                    onValueChange={(value) =>
                      setFormulario({ ...formulario, productoId: value === "all" ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los productos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los productos</SelectItem>
                      {productos.map((producto) => (
                        <SelectItem key={producto.id} value={producto.id}>
                          {producto.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipoRegla">Tipo de Regla</Label>
                  <Select
                    value={formulario.tipoRegla}
                    onValueChange={(value) => setFormulario({ ...formulario, tipoRegla: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposRegla.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="condicion">Condición</Label>
                  <Select
                    value={formulario.condicion}
                    onValueChange={(value) => setFormulario({ ...formulario, condicion: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {condiciones.map((cond) => (
                        <SelectItem key={cond.value} value={cond.value}>
                          {cond.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valor1">Valor</Label>
                  <Input
                    id="valor1"
                    type="number"
                    step="0.01"
                    value={formulario.valor1}
                    onChange={(e) => setFormulario({ ...formulario, valor1: e.target.value })}
                    required
                  />
                </div>

                {formulario.condicion === "entre" && (
                  <div>
                    <Label htmlFor="valor2">Valor Máximo</Label>
                    <Input
                      id="valor2"
                      type="number"
                      step="0.01"
                      value={formulario.valor2}
                      onChange={(e) => setFormulario({ ...formulario, valor2: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="tipoDescuento">Tipo de Descuento</Label>
                  <Select
                    value={formulario.tipoDescuento}
                    onValueChange={(value) => setFormulario({ ...formulario, tipoDescuento: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                      <SelectItem value="fijo">Cantidad Fija (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="descuento">
                    Descuento {formulario.tipoDescuento === "porcentaje" ? "(%)" : "(€)"}
                  </Label>
                  <Input
                    id="descuento"
                    type="number"
                    step="0.01"
                    value={formulario.descuento}
                    onChange={(e) => setFormulario({ ...formulario, descuento: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={cargando}>
                  {cargando ? "Guardando..." : "Guardar Regla"}
                </Button>
                <Button type="button" variant="outline" onClick={resetearFormulario}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reglas de Precio Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reglasPrecio.map((regla) => (
                <div key={regla.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{regla.nombre}</h4>
                    <Button size="sm" variant="destructive" onClick={() => eliminarRegla(regla.id)}>
                      Eliminar
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {tiposRegla.find((t) => t.value === regla.tipoRegla)?.label} -{" "}
                    {condiciones.find((c) => c.value === regla.condicion)?.label} {regla.valor1}
                    {regla.valor2 && ` y ${regla.valor2}`}
                  </p>
                  <p className="text-sm">
                    Descuento: {regla.descuento}
                    {regla.tipoDescuento === "porcentaje" ? "%" : "€"}
                  </p>
                </div>
              ))}
              {reglasPrecio.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay reglas de precio configuradas</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Precios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{productos.length}</div>
                  <div className="text-sm text-blue-800">Productos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{reglasPrecio.length}</div>
                  <div className="text-sm text-green-800">Reglas Activas</div>
                </div>
              </div>

              {productos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Rango de Precios</h4>
                  <div className="text-sm text-gray-600">
                    Mínimo: €{Math.min(...productos.map((p) => p.precioBase)).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Máximo: €{Math.max(...productos.map((p) => p.precioBase)).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Promedio: €{(productos.reduce((sum, p) => sum + p.precioBase, 0) / productos.length).toFixed(2)}
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

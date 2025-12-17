"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Calculator, Info, Package, Users, Ruler, Percent, DollarSign, TrendingUp, Layers, Sparkles, Wrench, PlusCircle, MinusCircle, ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"

export function CalculadoraPrecios({ productos, reglasPrecio, materiales = [], acabados = [] }) {
  const [calculadora, setCalculadora] = useState({
    productoId: "",
    cantidad: 1,
    ancho: 0,
    alto: 0,
    materialId: "",
    acabadoId: "",
    tipoCliente: "regular", // regular, vip, mayorista
    margenDeseado: 30,
    costoManoObra: 0,
    costoAdicional: 0,
  })

  const [resultado, setResultado] = useState(null)
  const [desglose, setDesglose] = useState([])
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false)

  const tiposCliente = [
    { value: "regular", label: "Cliente Regular", descuento: 0 },
    { value: "vip", label: "Cliente VIP", descuento: 5 },
    { value: "mayorista", label: "Mayorista", descuento: 15 },
  ]

  const calcularPrecioCompleto = () => {
    const producto = productos.find((p) => p.id === calculadora.productoId)
    if (!producto) return

    let precioBase = producto.precioBase
    let superficie = 0
    let costoMaterial = 0
    let costoAcabado = 0
    const detalles = []

    if (producto.unidadMedida === "m²" && calculadora.ancho && calculadora.alto) {
      superficie = (calculadora.ancho / 100) * (calculadora.alto / 100)
      precioBase = precioBase * superficie
      detalles.push({
        concepto: "Precio base por superficie",
        calculo: `€${producto.precioBase} × ${superficie.toFixed(2)}m²`,
        valor: precioBase,
      })
    } else {
      detalles.push({
        concepto: "Precio base",
        calculo: `€${producto.precioBase} × ${calculadora.cantidad}`,
        valor: precioBase * calculadora.cantidad,
      })
    }

    if (calculadora.materialId) {
      const material = materiales.find((m) => m.id === calculadora.materialId)
      if (material) {
        if (superficie > 0) {
          costoMaterial = material.pricePerUnit * superficie * calculadora.cantidad
        } else {
          costoMaterial = material.pricePerUnit * calculadora.cantidad
        }
        detalles.push({
          concepto: `Material: ${material.name}`,
          calculo: `€${material.pricePerUnit} × ${superficie > 0 ? superficie.toFixed(2) + "m²" : calculadora.cantidad}`,
          valor: costoMaterial,
        })
      }
    }

    if (calculadora.acabadoId) {
      const acabado = acabados.find((a) => a.id === calculadora.acabadoId)
      if (acabado) {
        costoAcabado = (precioBase + costoMaterial) * (acabado.priceModifier / 100)
        detalles.push({
          concepto: `Acabado: ${acabado.name}`,
          calculo: `(€${(precioBase + costoMaterial).toFixed(2)}) × ${acabado.priceModifier}%`,
          valor: costoAcabado,
        })
      }
    }

    let precioConReglas = precioBase + costoMaterial + costoAcabado
    const reglasAplicadas = []

    const reglasAplicables = reglasPrecio.filter(
      (regla) => regla.activa && (regla.productoId === "" || regla.productoId === calculadora.productoId),
    )

    reglasAplicables.forEach((regla) => {
      let aplicarRegla = false
      let razonAplicacion = ""

      switch (regla.tipoRegla) {
        case "cantidad":
          if (regla.condicion === "mayor_que" && calculadora.cantidad > regla.valor1) {
            aplicarRegla = true
            razonAplicacion = `Cantidad ${calculadora.cantidad} > ${regla.valor1}`
          }
          if (regla.condicion === "menor_que" && calculadora.cantidad < regla.valor1) {
            aplicarRegla = true
            razonAplicacion = `Cantidad ${calculadora.cantidad} < ${regla.valor1}`
          }
          if (
            regla.condicion === "entre" &&
            calculadora.cantidad >= regla.valor1 &&
            calculadora.cantidad <= regla.valor2
          ) {
            aplicarRegla = true
            razonAplicacion = `Cantidad ${calculadora.cantidad} entre ${regla.valor1}-${regla.valor2}`
          }
          break
        case "superficie":
          if (superficie > 0) {
            if (regla.condicion === "mayor_que" && superficie > regla.valor1) {
              aplicarRegla = true
              razonAplicacion = `Superficie ${superficie.toFixed(2)}m² > ${regla.valor1}m²`
            }
            if (regla.condicion === "menor_que" && superficie < regla.valor1) {
              aplicarRegla = true
              razonAplicacion = `Superficie ${superficie.toFixed(2)}m² < ${regla.valor1}m²`
            }
          }
          break
        case "material":
          if (regla.condicion === "igual_a" && calculadora.materialId === regla.valor1) {
            aplicarRegla = true
            const material = materiales.find((m) => m.id === regla.valor1)
            razonAplicacion = `Material: ${material?.name || regla.valor1}`
          }
          break
        case "acabado":
          if (regla.condicion === "igual_a" && calculadora.acabadoId === regla.valor1) {
            aplicarRegla = true
            const acabado = acabados.find((a) => a.id === regla.valor1)
            razonAplicacion = `Acabado: ${acabado?.name || regla.valor1}`
          }
          break
      }

      if (aplicarRegla) {
        const descuentoAnterior = precioConReglas
        if (regla.tipoDescuento === "porcentaje") {
          precioConReglas = precioConReglas * (1 - regla.descuento / 100)
        } else {
          precioConReglas = precioConReglas - regla.descuento
        }

        reglasAplicadas.push({
          nombre: regla.nombre,
          razon: razonAplicacion,
          descuento: regla.descuento,
          tipo: regla.tipoDescuento,
          ahorro: descuentoAnterior - precioConReglas,
        })
      }
    })

    const tipoClienteInfo = tiposCliente.find((t) => t.value === calculadora.tipoCliente)
    let descuentoCliente = 0
    if (tipoClienteInfo && tipoClienteInfo.descuento > 0) {
      descuentoCliente = precioConReglas * (tipoClienteInfo.descuento / 100)
      precioConReglas = precioConReglas - descuentoCliente
    }

    const costoTotal = precioConReglas + calculadora.costoManoObra + calculadora.costoAdicional

    const precioConMargen = costoTotal * (1 + calculadora.margenDeseado / 100)

    setResultado({
      costoBase: precioBase + costoMaterial + costoAcabado,
      precioConReglas,
      descuentoCliente,
      costoManoObra: calculadora.costoManoObra,
      costoAdicional: calculadora.costoAdicional,
      costoTotal,
      margen: calculadora.margenDeseado,
      precioFinal: precioConMargen,
      superficie,
      beneficioBruto: precioConMargen - costoTotal,
    })

    setDesglose([
      ...detalles,
      ...reglasAplicadas.map((regla) => ({
        concepto: `Regla: ${regla.nombre}`,
        calculo: regla.razon,
        valor: -regla.ahorro,
        esDescuento: true,
      })),
      ...(descuentoCliente > 0
        ? [
            {
              concepto: `Descuento ${tipoClienteInfo.label}`,
              calculo: `${tipoClienteInfo.descuento}% descuento`,
              valor: -descuentoCliente,
              esDescuento: true,
            },
          ]
        : []),
      ...(calculadora.costoManoObra > 0
        ? [
            {
              concepto: "Mano de obra",
              calculo: "Costo adicional",
              valor: calculadora.costoManoObra,
            },
          ]
        : []),
      ...(calculadora.costoAdicional > 0
        ? [
            {
              concepto: "Costos adicionales",
              calculo: "Otros gastos",
              valor: calculadora.costoAdicional,
            },
          ]
        : []),
    ])
  }

  useEffect(() => {
    if (calculadora.productoId) {
      calcularPrecioCompleto()
    }
  }, [calculadora, productos, reglasPrecio, materiales, acabados])

  return (
    <div className="space-y-4">
      {/* Header desplegable */}
      <button
        onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
        className="w-full flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Calculadora de Precios Avanzada</h3>
            <p className="text-xs text-gray-500">Reglas, descuentos y costos adicionales</p>
          </div>
        </div>
        {mostrarCalculadora ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Contenido desplegable */}
      {mostrarCalculadora && (
        <div className="space-y-6 pt-2">
          {/* Sección de Entrada - Diseño mejorado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda - Configuración Principal */}
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              Información del Producto
            </Label>
            <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div>
                <Label htmlFor="producto-calc" className="text-xs text-gray-600 mb-1.5 block">Producto *</Label>
                <Select
                  value={calculadora.productoId}
                  onValueChange={(value) => setCalculadora((prev) => ({ ...prev, productoId: value }))}
                >
                  <SelectTrigger id="producto-calc" className="bg-white border-gray-300 h-10">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    {productos.map((producto) => (
                      <SelectItem 
                        key={producto.id} 
                        value={producto.id}
                        className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5"
                      >
                        <div className="flex items-center justify-between w-full gap-3">
                          <span className="flex-1 text-sm">{producto.nombre}</span>
                          <Badge variant="outline" className="text-xs font-medium border-gray-300">
                            €{producto.precioBase?.toFixed(2) || '0.00'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cantidad-calc" className="text-xs text-gray-600 mb-1.5 flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Cantidad
                  </Label>
                  <Input
                    id="cantidad-calc"
                    type="number"
                    value={calculadora.cantidad}
                    onChange={(e) => setCalculadora((prev) => ({ ...prev, cantidad: Number.parseInt(e.target.value) || 1 }))}
                    min="1"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="tipo-cliente-calc" className="text-xs text-gray-600 mb-1.5 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Tipo Cliente
                  </Label>
                  <Select
                    value={calculadora.tipoCliente}
                    onValueChange={(value) => setCalculadora((prev) => ({ ...prev, tipoCliente: value }))}
                  >
                    <SelectTrigger id="tipo-cliente-calc" className="bg-white border-gray-300 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      {tiposCliente.map((tipo) => (
                        <SelectItem 
                          key={tipo.value} 
                          value={tipo.value}
                          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5"
                        >
                          <div className="flex items-center justify-between w-full gap-3">
                            <span className="flex-1 text-sm">{tipo.label}</span>
                            {tipo.descuento > 0 && (
                              <Badge className="text-xs font-medium bg-green-100 text-green-700 border-green-200">
                                -{tipo.descuento}%
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Dimensiones */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Ruler className="h-4 w-4 text-gray-500" />
              Dimensiones (opcional)
            </Label>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div>
                <Label htmlFor="ancho-calc" className="text-xs text-gray-600 mb-1.5 block">Ancho (cm)</Label>
                <Input
                  id="ancho-calc"
                  type="number"
                  value={calculadora.ancho}
                  onChange={(e) => setCalculadora((prev) => ({ ...prev, ancho: Number.parseFloat(e.target.value) || 0 }))}
                  step="0.1"
                  placeholder="0"
                  className="bg-white border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="alto-calc" className="text-xs text-gray-600 mb-1.5 block">Alto (cm)</Label>
                <Input
                  id="alto-calc"
                  type="number"
                  value={calculadora.alto}
                  onChange={(e) => setCalculadora((prev) => ({ ...prev, alto: Number.parseFloat(e.target.value) || 0 }))}
                  step="0.1"
                  placeholder="0"
                  className="bg-white border-gray-300"
                />
              </div>
              {calculadora.ancho > 0 && calculadora.alto > 0 && (
                <div className="col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">Superficie calculada:</span>
                      <Badge className="bg-blue-100 text-blue-700">
                        {((calculadora.ancho / 100) * (calculadora.alto / 100)).toFixed(2)} m²
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Materiales y Acabados */}
          {(materiales.length > 0 || acabados.length > 0) && (
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-gray-500" />
                Materiales y Acabados
              </Label>
              <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                {materiales.length > 0 && (
                  <div>
                    <Label htmlFor="material-calc" className="text-xs text-gray-600 mb-1.5 block">Material</Label>
                    <Select
                      value={calculadora.materialId}
                      onValueChange={(value) => setCalculadora((prev) => ({ ...prev, materialId: value === "none" ? "" : value }))}
                    >
                      <SelectTrigger id="material-calc" className="bg-white border-gray-300 h-10">
                        <SelectValue placeholder="Sin material específico" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <SelectItem value="none" className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5">
                          Sin material específico
                        </SelectItem>
                        {materiales.map((material) => (
                          <SelectItem 
                            key={material.id} 
                            value={material.id}
                            className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5"
                          >
                            <div className="flex items-center justify-between w-full gap-3">
                              <span className="flex-1 text-sm">{material.name}</span>
                              <Badge variant="outline" className="text-xs font-medium border-gray-300">
                                €{material.pricePerUnit}/{material.unit}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {acabados.length > 0 && (
                  <div>
                    <Label htmlFor="acabado-calc" className="text-xs text-gray-600 mb-1.5 block">Acabado</Label>
                    <Select
                      value={calculadora.acabadoId}
                      onValueChange={(value) => setCalculadora((prev) => ({ ...prev, acabadoId: value === "none" ? "" : value }))}
                    >
                      <SelectTrigger id="acabado-calc" className="bg-white border-gray-300 h-10">
                        <SelectValue placeholder="Sin acabado específico" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <SelectItem value="none" className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5">
                          Sin acabado específico
                        </SelectItem>
                        {acabados.map((acabado) => (
                          <SelectItem 
                            key={acabado.id} 
                            value={acabado.id}
                            className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5"
                          >
                            <div className="flex items-center justify-between w-full gap-3">
                              <span className="flex-1 text-sm">{acabado.name}</span>
                              <Badge className="text-xs font-medium bg-orange-100 text-orange-700 border-orange-200">
                                +{acabado.priceModifier}%
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Costos Adicionales */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-gray-500" />
              Costos Adicionales
            </Label>
            <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div>
                <Label htmlFor="margen-calc" className="text-xs text-gray-600 mb-1.5 flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  Margen Deseado (%)
                </Label>
                <Input
                  id="margen-calc"
                  type="number"
                  value={calculadora.margenDeseado}
                  onChange={(e) =>
                    setCalculadora((prev) => ({ ...prev, margenDeseado: Number.parseFloat(e.target.value) || 0 }))
                  }
                  step="0.1"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mano-obra-calc" className="text-xs text-gray-600 mb-1.5 block">Mano de Obra (€)</Label>
                  <Input
                    id="mano-obra-calc"
                    type="number"
                    value={calculadora.costoManoObra}
                    onChange={(e) =>
                      setCalculadora((prev) => ({ ...prev, costoManoObra: Number.parseFloat(e.target.value) || 0 }))
                    }
                    step="0.01"
                    placeholder="0.00"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="adicionales-calc" className="text-xs text-gray-600 mb-1.5 block">Otros Costos (€)</Label>
                  <Input
                    id="adicionales-calc"
                    type="number"
                    value={calculadora.costoAdicional}
                    onChange={(e) =>
                      setCalculadora((prev) => ({ ...prev, costoAdicional: Number.parseFloat(e.target.value) || 0 }))
                    }
                    step="0.01"
                    placeholder="0.00"
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Resultados */}
        {resultado && (
          <div className="space-y-6">
            {/* Precio Final Destacado */}
            <Card className="border-2 border-blue-300 bg-blue-50 shadow-md">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-blue-700" />
                    <Label className="text-sm font-medium text-gray-700">Precio Final</Label>
                  </div>
                  <div className="text-5xl font-bold text-blue-700 mb-2">
                    €{resultado.precioFinal.toFixed(2)}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                    <TrendingUp className="h-4 w-4 text-green-700" />
                    <span>Beneficio: €{resultado.beneficioBruto.toFixed(2)} ({((resultado.beneficioBruto / resultado.precioFinal) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumen de Costos */}
            <Card className="border border-gray-200 shadow-md">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Resumen de Costos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {resultado.superficie > 0 && (
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Ruler className="h-3 w-3" />
                        Superficie total
                      </span>
                      <Badge variant="outline" className="font-semibold">
                        {resultado.superficie.toFixed(2)} m²
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Costo base</span>
                    <span className="font-medium text-gray-900">€{resultado.costoBase.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Precio con reglas</span>
                    <span className="font-medium text-gray-900">€{resultado.precioConReglas.toFixed(2)}</span>
                  </div>

                  {resultado.descuentoCliente > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-700 flex items-center gap-2">
                        <MinusCircle className="h-3 w-3 text-green-600" />
                        Descuento cliente
                      </span>
                      <span className="font-semibold text-green-600">-€{resultado.descuentoCliente.toFixed(2)}</span>
                    </div>
                  )}

                  {resultado.costoManoObra > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-700">Mano de obra</span>
                      <span className="font-medium text-gray-900">€{resultado.costoManoObra.toFixed(2)}</span>
                    </div>
                  )}

                  {resultado.costoAdicional > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-700">Costos adicionales</span>
                      <span className="font-medium text-gray-900">€{resultado.costoAdicional.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2 border-t-2 border-gray-200 mt-2">
                    <span className="text-sm font-semibold text-gray-900">Costo total</span>
                    <span className="font-bold text-gray-900">€{resultado.costoTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 bg-green-50 rounded-lg px-3 mt-3">
                    <span className="text-sm font-semibold text-green-800 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Margen ({resultado.margen}%)
                    </span>
                    <span className="font-bold text-green-700">€{resultado.beneficioBruto.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desglose Detallado */}
            {desglose.length > 0 && (
              <Card className="border border-gray-200 shadow-md">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Desglose Detallado
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {desglose.map((item, index) => (
                      <div 
                        key={index} 
                        className={`flex justify-between items-start p-3 rounded-lg border ${
                          item.esDescuento 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {item.esDescuento ? (
                              <MinusCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                            ) : (
                              <PlusCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />
                            )}
                            <span className="font-medium text-sm text-gray-900">{item.concepto}</span>
                          </div>
                          <div className="text-xs text-gray-600 ml-5">{item.calculo}</div>
                        </div>
                        <div className={`font-bold text-sm ml-3 ${
                          item.esDescuento ? "text-green-600" : "text-gray-900"
                        }`}>
                          {item.esDescuento ? "-" : "+"}€{Math.abs(item.valor).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!resultado && calculadora.productoId && (
          <div className="lg:col-span-1 flex items-center justify-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Calculando precio...</p>
            </div>
          </div>
        )}

        {!calculadora.productoId && (
          <div className="lg:col-span-1 flex items-center justify-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">Selecciona un producto</p>
              <p className="text-gray-500 text-sm">Los resultados aparecerán aquí</p>
            </div>
          </div>
        )}
          </div>
        </div>
      )}
    </div>
  )
}

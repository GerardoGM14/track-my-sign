"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Calculator, Info } from "lucide-react"

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculadora de Precios Avanzada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label>Producto</Label>
            <Select
              value={calculadora.productoId}
              onValueChange={(value) => setCalculadora((prev) => ({ ...prev, productoId: value }))}
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
              value={calculadora.cantidad}
              onChange={(e) => setCalculadora((prev) => ({ ...prev, cantidad: Number.parseInt(e.target.value) || 1 }))}
              min="1"
            />
          </div>

          <div>
            <Label>Tipo de Cliente</Label>
            <Select
              value={calculadora.tipoCliente}
              onValueChange={(value) => setCalculadora((prev) => ({ ...prev, tipoCliente: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposCliente.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label} {tipo.descuento > 0 && `(-${tipo.descuento}%)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Ancho (cm)</Label>
            <Input
              type="number"
              value={calculadora.ancho}
              onChange={(e) => setCalculadora((prev) => ({ ...prev, ancho: Number.parseFloat(e.target.value) || 0 }))}
              step="0.1"
            />
          </div>

          <div>
            <Label>Alto (cm)</Label>
            <Input
              type="number"
              value={calculadora.alto}
              onChange={(e) => setCalculadora((prev) => ({ ...prev, alto: Number.parseFloat(e.target.value) || 0 }))}
              step="0.1"
            />
          </div>

          <div>
            <Label>Margen Deseado (%)</Label>
            <Input
              type="number"
              value={calculadora.margenDeseado}
              onChange={(e) =>
                setCalculadora((prev) => ({ ...prev, margenDeseado: Number.parseFloat(e.target.value) || 0 }))
              }
              step="0.1"
            />
          </div>

          {materiales.length > 0 && (
            <div>
              <Label>Material</Label>
              <Select
                value={calculadora.materialId}
                onValueChange={(value) => setCalculadora((prev) => ({ ...prev, materialId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin material específico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin material específico</SelectItem>
                  {materiales.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name} - €{material.pricePerUnit}/{material.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {acabados.length > 0 && (
            <div>
              <Label>Acabado</Label>
              <Select
                value={calculadora.acabadoId}
                onValueChange={(value) => setCalculadora((prev) => ({ ...prev, acabadoId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin acabado específico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin acabado específico</SelectItem>
                  {acabados.map((acabado) => (
                    <SelectItem key={acabado.id} value={acabado.id}>
                      {acabado.name} (+{acabado.priceModifier}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Costo Mano de Obra (€)</Label>
            <Input
              type="number"
              value={calculadora.costoManoObra}
              onChange={(e) =>
                setCalculadora((prev) => ({ ...prev, costoManoObra: Number.parseFloat(e.target.value) || 0 }))
              }
              step="0.01"
            />
          </div>

          <div>
            <Label>Costos Adicionales (€)</Label>
            <Input
              type="number"
              value={calculadora.costoAdicional}
              onChange={(e) =>
                setCalculadora((prev) => ({ ...prev, costoAdicional: Number.parseFloat(e.target.value) || 0 }))
              }
              step="0.01"
            />
          </div>
        </div>

        {resultado && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Desglose de Costos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {desglose.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <div className="font-medium">{item.concepto}</div>
                        <div className="text-sm text-gray-600">{item.calculo}</div>
                      </div>
                      <div className={`font-semibold ${item.esDescuento ? "text-green-600" : "text-gray-900"}`}>
                        {item.esDescuento ? "" : "+"}€{Math.abs(item.valor).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen Final</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resultado.superficie > 0 && (
                    <div className="flex justify-between">
                      <span>Superficie total:</span>
                      <Badge variant="outline">{resultado.superficie.toFixed(2)} m²</Badge>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Costo base:</span>
                    <span>€{resultado.costoBase.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Precio con reglas:</span>
                    <span>€{resultado.precioConReglas.toFixed(2)}</span>
                  </div>

                  {resultado.descuentoCliente > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento cliente:</span>
                      <span>-€{resultado.descuentoCliente.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Costo total:</span>
                    <span>€{resultado.costoTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Margen ({resultado.margen}%):</span>
                    <span>€{resultado.beneficioBruto.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Precio Final:</span>
                    <span>€{resultado.precioFinal.toFixed(2)}</span>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Info className="w-4 h-4" />
                      <span className="font-medium">Rentabilidad</span>
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      Beneficio: €{resultado.beneficioBruto.toFixed(2)} (
                      {((resultado.beneficioBruto / resultado.precioFinal) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

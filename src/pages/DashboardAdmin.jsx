"use client"
import { useParams } from "react-router-dom"
import {
  Plus,
  ArrowUpRight,
  MoreVertical,
  FileText,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { NavLinkViewTransition } from "../components/NavLinkViewTransition"

export default function DashboardAdmin() {
  const { slugTienda } = useParams()

  // KPIs adaptados al negocio de imprentas y rotulación
  const kpis = [
    {
      titulo: "Cotizaciones Pendientes",
      valor: "24",
      cambio: "8.2",
      bgColor: "bg-blue-600",
      graficoColor: "#2563eb",
      tipoGrafico: "linea",
    },
    {
      titulo: "Órdenes en Producción",
      valor: "18",
      cambio: "15.3",
      bgColor: "bg-cyan-500",
      graficoColor: "#06b6d4",
      tipoGrafico: "linea",
    },
    {
      titulo: "Facturas Pendientes",
      valor: "12",
      cambio: "-5.1",
      bgColor: "bg-orange-500",
      graficoColor: "#f97316",
      tipoGrafico: "barras",
    },
    {
      titulo: "Ventas del Mes",
      valor: "$45.2K",
      cambio: "22.8",
      bgColor: "bg-pink-500",
      graficoColor: "#ec4899",
      tipoGrafico: "linea",
    },
  ]

  // Datos para Performance Overview - Ventas y Conversión
  const performanceData = [
    { fecha: "03 Ene", cotizaciones: 12, ordenes: 8, facturas: 6, ingresos: 8500 },
    { fecha: "10 Ene", cotizaciones: 15, ordenes: 11, facturas: 9, ingresos: 12000 },
    { fecha: "17 Ene", cotizaciones: 18, ordenes: 14, facturas: 12, ingresos: 15000 },
    { fecha: "24 Ene", cotizaciones: 22, ordenes: 18, facturas: 15, ingresos: 18000 },
    { fecha: "31 Ene", cotizaciones: 24, ordenes: 20, facturas: 18, ingresos: 22000 },
  ]

  // Top Productos/Servicios más vendidos
  const topProductos = [
    { nombre: "Letras Corpóreas", categoria: "Señalética", porcentaje: 85, color: "bg-blue-600" },
    { nombre: "Vinilos Decorativos", categoria: "Decoración", porcentaje: 72, color: "bg-cyan-500" },
    { nombre: "Impresión Digital", categoria: "Impresión", porcentaje: 68, color: "bg-orange-500" },
    { nombre: "Señalética Interior", categoria: "Señalética", porcentaje: 64, color: "bg-pink-500" },
    { nombre: "Señalética Exterior", categoria: "Señalética", porcentaje: 58, color: "bg-green-500" },
  ]

  // Generar puntos para gráficos de área
  const generarPuntosArea = (valores, maxValor, altura) => {
    const puntos = valores.map((v, i) => `${(i / (valores.length - 1)) * 100}%,${altura - (v / maxValor) * altura}`)
    return `0,${altura} ${puntos.join(" ")} 100%,${altura}`
  }

  // Generar puntos para líneas
  const generarPuntosLinea = (valores, maxValor, altura) => {
    return valores.map((v, i) => `${(i / (valores.length - 1)) * 100}%,${altura - (v / maxValor) * altura}`).join(" ")
  }

  // Valores para mini gráficos (más variados para mejor visualización)
  const valoresGrafico = {
    linea: [25, 35, 30, 45, 40, 55, 50, 60],
    barras: [35, 50, 40, 60, 45, 70, 55, 65],
  }

  // Generar puntos para gráficos de área mejorados
  const generarPuntosAreaMejorado = (valores, maxValor, altura, ancho) => {
    const puntos = valores.map((v, i) => `${(i / (valores.length - 1)) * ancho},${altura - (v / maxValor) * altura}`)
    return `0,${altura} ${puntos.join(" ")} ${ancho},${altura}`
  }

  // Generar puntos para líneas mejoradas
  const generarPuntosLineaMejorado = (valores, maxValor, altura, ancho) => {
    return valores.map((v, i) => `${(i / (valores.length - 1)) * ancho},${altura - (v / maxValor) * altura}`).join(" ")
  }

  return (
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Gestión de Tienda</h1>
          <p className="text-sm text-gray-600 mt-1 leading-tight">Bienvenido al Dashboard de TrackMySign</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cotización
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <FileText className="mr-2 h-4 w-4" />
            Reportes
          </Button>
        </div>
      </div>

      {/* KPIs Cards (estilo dashlite exacto) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card
            key={index}
            className={`border-0 shadow-lg ${kpi.bgColor} relative overflow-hidden rounded-xl hover:shadow-xl transition-shadow`}
          >
            <div className="absolute top-3 right-3 z-10">
              <button className="p-1 hover:bg-white/10 rounded transition-colors">
                <MoreVertical className="h-4 w-4 text-white/80" />
              </button>
            </div>
            <CardContent className="p-4">
              <div className="mb-3">
                <p className="text-xs font-medium text-white/90 mb-1.5 leading-tight">{kpi.titulo}</p>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <h3 className="text-2xl font-bold text-white leading-tight">{kpi.valor}</h3>
                </div>
                <div className="flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-white mr-1" />
                  <span className="text-xs font-semibold text-white leading-tight">↑ {kpi.cambio}%</span>
                </div>
              </div>
              {/* Mini gráfico interno extendido */}
              <div className="mt-3 h-16 relative -mx-4 px-4">
                {kpi.tipoGrafico === "linea" ? (
                  <svg width="100%" height="64" className="overflow-visible" viewBox="0 0 300 64" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="white" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="white" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    {/* Área sombreada */}
                    <polygon
                      points={generarPuntosAreaMejorado(valoresGrafico.linea, 70, 64, 300)}
                      fill={`url(#gradient-${index})`}
                    />
                    {/* Línea principal */}
                    <polyline
                      points={generarPuntosLineaMejorado(valoresGrafico.linea, 70, 64, 300)}
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Puntos en la línea para interactividad */}
                    {valoresGrafico.linea.map((v, i) => (
                      <circle
                        key={i}
                        cx={(i / (valoresGrafico.linea.length - 1)) * 300}
                        cy={64 - (v / 70) * 64}
                        r="2.5"
                        fill="white"
                        className="hover:r-3.5 transition-all cursor-pointer"
                      />
                    ))}
                  </svg>
                ) : (
                  <div className="flex items-end gap-1 h-full">
                    {valoresGrafico.barras.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-white/50 rounded-t hover:bg-white/70 transition-all cursor-pointer"
                        style={{ height: `${(h / 70) * 100}%` }}
                        title={`Valor: ${h}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Overview y Top Channels */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Performance Overview */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Resumen de Rendimiento</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-600 hover:bg-gray-100 h-7 px-3"
              >
                Semana
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 h-7 px-3 border-b-2 border-blue-600"
              >
                Mensual
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Leyenda */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-600 leading-tight">Cotizaciones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-600 leading-tight">Órdenes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-xs text-gray-600 leading-tight">Facturas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-xs text-gray-600 leading-tight">Ingresos (K)</span>
              </div>
            </div>
            {/* Gráfico */}
            <div className="h-64 relative">
              <svg width="100%" height="100%" className="overflow-visible">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 50}
                    x2="100%"
                    y2={i * 50}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                ))}
                {/* Líneas del gráfico */}
                <polyline
                  points={generarPuntosLinea(
                    performanceData.map((d) => d.cotizaciones),
                    24,
                    256
                  )}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={generarPuntosLinea(
                    performanceData.map((d) => d.ordenes),
                    24,
                    256
                  )}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={generarPuntosLinea(
                    performanceData.map((d) => d.facturas),
                    24,
                    256
                  )}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={generarPuntosLinea(
                    performanceData.map((d) => d.ingresos / 100),
                    250,
                    256
                  )}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Labels eje X */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                {performanceData.map((d, i) => (
                  <span key={i} className="text-xs text-gray-600 font-medium leading-tight">
                    {d.fecha}
                  </span>
                ))}
              </div>
              {/* Labels eje Y */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-2">
                {[0, 5, 10, 15, 20, 25].map((val) => (
                  <span key={val} className="text-xs text-gray-500 leading-tight">
                    {val}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Productos */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Productos Más Vendidos</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
              Ver todos
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProductos.map((producto, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${producto.color}`}>
                        {producto.nombre[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{producto.nombre}</p>
                        <p className="text-xs text-gray-500 leading-tight">{producto.categoria}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 leading-tight">{producto.porcentaje}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${producto.color} transition-all`}
                      style={{ width: `${producto.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

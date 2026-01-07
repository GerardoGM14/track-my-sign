"use client"
import { useState, useRef, useEffect } from "react"
import { useParams } from "react-router-dom"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoTienda } from "../contexts/ContextoTienda"
import {
  Plus,
  ArrowUpRight,
  MoreVertical,
  FileText,
  Calendar,
  Check,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  MapPin,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { NavLinkViewTransition } from "../components/NavLinkViewTransition"
import { LoadingSpinner } from "../components/ui/loading-spinner"
import nameSub from "../assets/subs/name_sub.svg"
import TarjetaLicencia from "../components/TarjetaLicencia"

export default function DashboardAdmin() {
  const { slugTienda } = useParams()
  const { tiendaActual } = useContextoTienda()
  const [openMenus, setOpenMenus] = useState({})
  const [tooltip, setTooltip] = useState(null)
  const [productos, setProductos] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const menuRefs = useRef({})

  // Cargar productos de Firebase
  useEffect(() => {
    if (tiendaActual) {
      cargarProductos()
    }
  }, [tiendaActual])

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true)
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
      setCargandoProductos(false)
    }
  }

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(menuRefs.current).forEach((key) => {
        const ref = menuRefs.current[key]
        if (ref && !ref.contains(event.target)) {
          setOpenMenus(prev => ({ ...prev, [key]: false }))
        }
      })
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Calcular top productos basado en datos reales
  const calcularTopProductos = () => {
    if (productos.length === 0) return []
    
    // Agrupar por categoría y contar
    const productosPorCategoria = productos.reduce((acc, producto) => {
      const categoria = producto.categoria || "Sin categoría"
      if (!acc[categoria]) {
        acc[categoria] = {
          nombre: categoria,
          categoria: categoria,
          cantidad: 0,
          productos: []
        }
      }
      acc[categoria].cantidad++
      acc[categoria].productos.push(producto)
      return acc
    }, {})

    // Convertir a array y ordenar por cantidad
    const topProductosArray = Object.values(productosPorCategoria)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
      .map((item, index) => {
        const colores = ["bg-blue-600", "bg-cyan-500", "bg-orange-500", "bg-pink-500", "bg-green-500"]
        const maxCantidad = Math.max(...Object.values(productosPorCategoria).map(p => p.cantidad))
        const porcentaje = Math.round((item.cantidad / maxCantidad) * 100)
        
        return {
          nombre: item.nombre,
          categoria: item.categoria,
          porcentaje: porcentaje,
          cantidad: item.cantidad,
          color: colores[index] || "bg-gray-500"
        }
      })

    return topProductosArray
  }

  const topProductos = calcularTopProductos()

  // KPIs adaptados al negocio de imprentas y rotulación
  const kpis = [
    {
      titulo: "Cotizaciones Pendientes",
      valor: "24",
      cambio: "8.2",
      bgColor: "rgb(115, 58, 234)",
      graficoColor: "#733AEA",
      tipoGrafico: "linea",
    },
    {
      titulo: "Órdenes en Producción",
      valor: "18",
      cambio: "15.3",
      bgColor: "rgb(5, 142, 252)",
      graficoColor: "#058EFC",
      tipoGrafico: "linea",
    },
    {
      titulo: "Facturas Pendientes",
      valor: "12",
      cambio: "-5.1",
      bgColor: "rgb(253, 151, 34)",
      graficoColor: "#FD9722",
      tipoGrafico: "barras",
    },
    {
      titulo: "Ventas del Mes",
      valor: "$45.2K",
      cambio: "22.8",
      bgColor: "rgb(242, 66, 110)",
      graficoColor: "#F2426E",
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

  // Top Productos se calcula dinámicamente desde Firebase

  // Órdenes activas
  const ordenesActivas = [
    {
      id: 1,
      proyecto: "Letras Corpóreas - Empresa ABC",
      cliente: "Empresa ABC",
      estado: "En Progreso",
      estadoColor: "bg-green-100 text-green-800",
      asignado: ["Juan", "María", "Pedro"],
      fechaCreacion: "01 Dic 22",
      fechaEntrega: "01 Dic - 07 Dic",
      prioridad: "Alta",
    },
    {
      id: 2,
      proyecto: "Vinilos Decorativos - Tienda XYZ",
      cliente: "Tienda XYZ",
      estado: "En Progreso",
      estadoColor: "bg-green-100 text-green-800",
      asignado: ["Ana", "Luis", "Carlos"],
      fechaCreacion: "28 Nov 22",
      fechaEntrega: "01 Dic - 07 Dic",
      prioridad: "Media",
    },
    {
      id: 3,
      proyecto: "Señalética Interior - Oficinas Corp",
      cliente: "Oficinas Corp",
      estado: "Pausada",
      estadoColor: "bg-orange-100 text-orange-800",
      asignado: ["Sofía", "Miguel"],
      fechaCreacion: "15 Nov 22",
      fechaEntrega: "01 Dic - 07 Dic",
      prioridad: "Baja",
    },
    {
      id: 4,
      proyecto: "Impresión Digital - Evento Navideño",
      cliente: "Eventos Plus",
      estado: "En Progreso",
      estadoColor: "bg-green-100 text-green-800",
      asignado: ["Laura", "Diego", "Elena"],
      fechaCreacion: "12 Dic 22",
      fechaEntrega: "01 Dic - 07 Dic",
      prioridad: "Alta",
    },
  ]

  // Estadísticas clave
  const estadisticasClave = [
    {
      titulo: "Tiempo Promedio de Producción",
      valor: "3.2 días",
      porcentaje: 64,
      colorBarra: "rgb(115, 58, 234)",
      periodo: "Dic 22 - Feb 23",
    },
    {
      titulo: "Tasa de Aprobación",
      valor: "78.5%",
      porcentaje: 78,
      colorBarra: "rgb(5, 142, 252)",
      periodo: "Dic 22 - Feb 23",
    },
    {
      titulo: "Satisfacción del Cliente",
      valor: "4.6/5",
      porcentaje: 92,
      colorBarra: "rgb(253, 151, 34)",
      periodo: "Dic 22 - Feb 23",
    },
  ]

  // Top clientes por ubicación
  const topClientes = [
    { ubicacion: "Ciudad de México", ordenes: 145 },
    { ubicacion: "Guadalajara", ordenes: 98 },
    { ubicacion: "Monterrey", ordenes: 87 },
    { ubicacion: "Puebla", ordenes: 65 },
    { ubicacion: "Tijuana", ordenes: 54 },
    { ubicacion: "León", ordenes: 42 },
    { ubicacion: "Querétaro", ordenes: 38 },
    { ubicacion: "Mérida", ordenes: 25 },
  ]

  // Datos de conversión
  const datosConversion = [
    { mes: "Jan", tasa: 20 },
    { mes: "Feb", tasa: 18 },
    { mes: "Mar", tasa: 30 },
    { mes: "Apr", tasa: 40 },
    { mes: "May", tasa: 60 },
    { mes: "Jun", tasa: 52 },
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

  // Generar puntos para líneas con coordenadas absolutas (para SVG con viewBox)
  const generarPuntosLineaAbsoluto = (valores, maxValor, altura, ancho) => {
    return valores.map((v, i) => `${(i / (valores.length - 1)) * ancho},${altura - (v / maxValor) * altura}`).join(" ")
  }

  // Generar puntos para área con coordenadas absolutas
  // alturaBase es la coordenada Y donde está el eje X (línea base)
  const generarPuntosAreaAbsoluto = (valores, maxValor, alturaBase, ancho) => {
    const puntos = valores.map((v, i) => `${(i / (valores.length - 1)) * ancho},${alturaBase - (v / maxValor) * alturaBase}`)
    // El área va desde la línea base (eje X) hasta los puntos de datos
    return `0,${alturaBase} ${puntos.join(" ")} ${ancho},${alturaBase}`
  }

  // Generar path con curvas suaves usando curvas de Bézier cúbicas (smooth curves)
  const generarPathCurvaSuave = (valores, maxValor, alturaBase, ancho) => {
    if (valores.length === 0) return ""
    if (valores.length === 1) return `M 0,${alturaBase - (valores[0] / maxValor) * alturaBase}`
    
    const puntos = valores.map((v, i) => ({
      x: (i / (valores.length - 1)) * ancho,
      y: alturaBase - (v / maxValor) * alturaBase
    }))
    
    let path = `M ${puntos[0].x},${puntos[0].y}`
    
    for (let i = 0; i < puntos.length - 1; i++) {
      const p0 = puntos[i]
      const p1 = puntos[i + 1]
      const pAnterior = puntos[i - 1] || p0
      const pSiguiente = puntos[i + 2] || p1
      
      // Calcular puntos de control para curvas suaves
      const tension = 0.3
      const cp1x = p0.x + (p1.x - pAnterior.x) * tension
      const cp1y = p0.y + (p1.y - pAnterior.y) * tension
      const cp2x = p1.x - (pSiguiente.x - p0.x) * tension
      const cp2y = p1.y - (pSiguiente.y - p0.y) * tension
      
      if (i === 0) {
        // Primer segmento
        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`
      } else if (i === puntos.length - 2) {
        // Último segmento
        path += ` S ${cp2x},${cp2y} ${p1.x},${p1.y}`
      } else {
        // Segmentos intermedios
        path += ` S ${cp2x},${cp2y} ${p1.x},${p1.y}`
      }
    }
    
    return path
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
    <div className="space-y-6 min-h-full px-18">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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

      {/* SVG Decorativos encima de los cards */}
      <div className="flex items-start justify-between gap-1 mb-4 w-full">
        <img 
          src={nameSub} 
          alt="Decoración nombre" 
          className="h-[180px] md:h-[200px] lg:h-[220px] w-auto object-contain"
          style={{ display: 'block', margin: 0, padding: 0, lineHeight: 0, flexShrink: 0 }}
        />
        <TarjetaLicencia />
      </div>

      {/* KPIs Cards (estilo dashlite exacto) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card
            key={index}
            className="border-0 shadow-lg relative overflow-hidden rounded-xl hover:shadow-xl transition-shadow"
            style={{ backgroundColor: kpi.bgColor }}
          >
            <div className="absolute top-3 right-3 z-10" ref={el => menuRefs.current[index] = el}>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenMenus(prev => ({ ...prev, [index]: !prev[index] }))
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-white/80" />
              </button>
              {openMenus[index] && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  <div
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100"
                    onClick={() => setOpenMenus(prev => ({ ...prev, [index]: false }))}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4 text-blue-600" />
                    </span>
                    15 Days
                  </div>
                  <div
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100"
                    onClick={() => setOpenMenus(prev => ({ ...prev, [index]: false }))}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    </span>
                    30 Days
                  </div>
                  <div
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100"
                    onClick={() => setOpenMenus(prev => ({ ...prev, [index]: false }))}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    </span>
                    3 Months
                  </div>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="mb-3">
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="flex items-baseline gap-0">
                    <h3 className="text-2xl font-bold text-white leading-tight">{kpi.valor}</h3>
                    <div className="flex items-center ml-1">
                      <ArrowUpRight className="h-3 w-3 text-white mr-0.5" />
                      <span className="text-xs font-semibold text-white leading-tight">{kpi.cambio}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs font-medium text-white/90 leading-tight">{kpi.titulo}</p>
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
            </div>
            {/* Gráfico */}
            <div className="h-64 relative" ref={(el) => { if (el) menuRefs.current['chart'] = el }}>
              <svg width="100%" height="100%" viewBox="0 0 500 256" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
                <defs>
                  <linearGradient id="gradient-cotizaciones" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="gradient-ordenes" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#10b981" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="gradient-facturas" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#f97316" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                  </linearGradient>
                  {/* Clip path para limitar el área sombreada al área del gráfico */}
                  <clipPath id="chart-clip">
                    <rect x="0" y="0" width="440" height="240" />
                  </clipPath>
                </defs>
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line
                    key={i}
                    x1="40"
                    y1={i * 51.2}
                    x2="480"
                    y2={i * 51.2}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                ))}
                {/* Áreas sombreadas - dibujadas después de las grid lines pero antes de las líneas */}
                {/* El área debe ir desde la línea base (y=240) hasta los puntos de datos */}
                <g transform="translate(40, 0)">
                  <polygon
                    points={generarPuntosAreaAbsoluto(
                      performanceData.map((d) => d.cotizaciones),
                      25,
                      240,
                      440
                    )}
                    fill="url(#gradient-cotizaciones)"
                    clipPath="url(#chart-clip)"
                  />
                  <polygon
                    points={generarPuntosAreaAbsoluto(
                      performanceData.map((d) => d.ordenes),
                      25,
                      240,
                      440
                    )}
                    fill="url(#gradient-ordenes)"
                    clipPath="url(#chart-clip)"
                  />
                  <polygon
                    points={generarPuntosAreaAbsoluto(
                      performanceData.map((d) => d.facturas),
                      25,
                      240,
                      440
                    )}
                    fill="url(#gradient-facturas)"
                    clipPath="url(#chart-clip)"
                  />
                </g>
                {/* Líneas del gráfico - dibujadas después de las áreas para que estén encima */}
                <g transform="translate(40, 0)" clipPath="url(#chart-clip)">
                  <polyline
                    points={generarPuntosLineaAbsoluto(
                      performanceData.map((d) => d.cotizaciones),
                      25,
                      240,
                      440
                    )}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points={generarPuntosLineaAbsoluto(
                      performanceData.map((d) => d.ordenes),
                      25,
                      240,
                      440
                    )}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points={generarPuntosLineaAbsoluto(
                      performanceData.map((d) => d.facturas),
                      25,
                      240,
                      440
                    )}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                {/* Puntos en las líneas */}
                {performanceData.map((d, i) => {
                  const x = 40 + (i / (performanceData.length - 1)) * 440
                  const y = 240 - (d.cotizaciones / 25) * 240
                  return (
                    <g key={`cotizaciones-${i}`} transform={`translate(${x}, ${y})`}>
                      <circle 
                        r="4" 
                        fill="#3b82f6" 
                        className="hover:r-5 transition-all cursor-pointer"
                        onMouseEnter={(e) => {
                          const chartContainer = menuRefs.current['chart']
                          if (chartContainer) {
                            const rect = chartContainer.getBoundingClientRect()
                            setTooltip({
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top,
                              text: `Cotizaciones: ${d.cotizaciones}`,
                              fecha: d.fecha
                            })
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    </g>
                  )
                })}
                {performanceData.map((d, i) => {
                  const x = 40 + (i / (performanceData.length - 1)) * 440
                  const y = 240 - (d.ordenes / 25) * 240
                  return (
                    <g key={`ordenes-${i}`} transform={`translate(${x}, ${y})`}>
                      <circle 
                        r="4" 
                        fill="#10b981" 
                        className="hover:r-5 transition-all cursor-pointer"
                        onMouseEnter={(e) => {
                          const chartContainer = menuRefs.current['chart']
                          if (chartContainer) {
                            const rect = chartContainer.getBoundingClientRect()
                            setTooltip({
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top,
                              text: `Órdenes: ${d.ordenes}`,
                              fecha: d.fecha
                            })
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    </g>
                  )
                })}
                {performanceData.map((d, i) => {
                  const x = 40 + (i / (performanceData.length - 1)) * 440
                  const y = 240 - (d.facturas / 25) * 240
                  return (
                    <g key={`facturas-${i}`} transform={`translate(${x}, ${y})`}>
                      <circle 
                        r="4" 
                        fill="#f97316" 
                        className="hover:r-5 transition-all cursor-pointer"
                        onMouseEnter={(e) => {
                          const chartContainer = menuRefs.current['chart']
                          if (chartContainer) {
                            const rect = chartContainer.getBoundingClientRect()
                            setTooltip({
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top,
                              text: `Facturas: ${d.facturas}`,
                              fecha: d.fecha
                            })
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    </g>
                  )
                })}
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
                  <div className="font-semibold mb-1">{tooltip.fecha}</div>
                  <div>{tooltip.text}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
              {/* Labels eje X */}
              <div className="absolute -bottom-6 left-12 right-12 flex justify-between">
                {performanceData.map((d, i) => (
                  <span key={i} className="text-xs text-gray-600 font-medium leading-tight">
                    {d.fecha}
                  </span>
                ))}
              </div>
              {/* Labels eje Y */}
              <div className="absolute left-2 top-2 bottom-2 flex flex-col justify-between">
                {[0, 5, 10, 15, 20, 25].map((val) => (
                  <span key={val} className="text-xs text-gray-500 font-medium leading-tight">
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
            {cargandoProductos ? (
              <LoadingSpinner texto="Cargando productos..." tamaño="sm" />
            ) : topProductos.length > 0 ? (
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
                          <p className="text-xs text-gray-500 leading-tight">{producto.cantidad} productos</p>
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
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-2">No hay productos registrados</p>
                <p className="text-xs text-gray-400">Agrega productos para ver estadísticas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Órdenes Activas y Estadísticas Clave */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Órdenes Activas */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Órdenes Activas</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
              Ver todas
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordenesActivas.map((orden) => (
                <div key={orden.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 leading-tight mb-1">{orden.proyecto}</p>
                      <p className="text-xs text-gray-500 leading-tight">Creada el {orden.fechaCreacion}</p>
                    </div>
                    <Badge className={`${orden.estadoColor} text-xs font-medium`}>{orden.estado}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {orden.asignado.slice(0, 3).map((nombre, idx) => (
                          <div
                            key={idx}
                            className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                          >
                            {nombre[0]}
                          </div>
                        ))}
                        {orden.asignado.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
                            +{orden.asignado.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>{orden.fechaEntrega}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas Clave */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Estadísticas Clave</CardTitle>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {estadisticasClave.map((stat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600 leading-tight">{stat.titulo}</p>
                    <span className="text-sm font-bold text-gray-900 leading-tight">{stat.valor}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${stat.porcentaje}%`, backgroundColor: stat.colorBarra }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 leading-tight">{stat.periodo}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clientes y Tasa de Conversión */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Clientes por Ubicación */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Clientes por Ubicación</CardTitle>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
              {topClientes.map((cliente, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 leading-tight">{cliente.ubicacion}</span>
                </div>
                  <span className="text-sm font-semibold text-gray-700 leading-tight">{cliente.ordenes.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

        {/* Tasa de Conversión */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Tasa de Conversión</CardTitle>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900 leading-tight mb-1">3.86%</p>
              <p className="text-xs text-gray-500 leading-tight">Este mes</p>
            </div>
            <div className="h-48 relative" ref={(el) => { if (el) menuRefs.current['conversion-chart'] = el }}>
              <svg width="100%" height="100%" viewBox="0 0 500 192" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
                <defs>
                  <linearGradient id="conversionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F2426E" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#F2426E" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#F2426E" stopOpacity="0.02" />
                  </linearGradient>
                  <clipPath id="conversion-clip">
                    <rect x="40" y="0" width="440" height="192" />
                  </clipPath>
                </defs>
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <line
                    key={i}
                    x1="40"
                    y1={i * 32}
                    x2="480"
                    y2={i * 32}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                ))}
                {/* Área sombreada - debe comenzar desde x=0 (inicio del gráfico) */}
                <g transform="translate(40, 0)">
                  <path
                    d={`${generarPathCurvaSuave(
                      datosConversion.map((d) => d.tasa),
                      70,
                      192,
                      440
                    )} L 440,192 L 0,192 Z`}
                    fill="url(#conversionGradient)"
                  />
                </g>
                {/* Línea del gráfico con curvas suaves */}
                <g transform="translate(40, 0)">
                  <path
                    d={generarPathCurvaSuave(
                      datosConversion.map((d) => d.tasa),
                      70,
                      192,
                      440
                    )}
                    fill="none"
                    stroke="#F2426E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Puntos en la línea */}
                  {datosConversion.map((d, i) => {
                    const x = (i / (datosConversion.length - 1)) * 440
                    const y = 192 - (d.tasa / 70) * 192
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#F2426E"
                        className="hover:r-5 transition-all cursor-pointer"
                        onMouseEnter={(e) => {
                          const chartContainer = menuRefs.current['conversion-chart']
                          if (chartContainer) {
                            const rect = chartContainer.getBoundingClientRect()
                            setTooltip({
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top,
                              text: `Tasa: ${d.tasa}%`,
                              fecha: d.mes
                            })
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    )
                  })}
                </g>
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
                  <div className="font-semibold mb-1">{tooltip.fecha}</div>
                  <div>{tooltip.text}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
              {/* Labels eje X */}
              <div className="absolute -bottom-6 left-12 right-12 flex justify-between">
                {datosConversion.map((d, i) => (
                  <span key={i} className="text-xs text-gray-600 font-medium leading-tight">
                    {d.mes}
                  </span>
                ))}
              </div>
              {/* Labels eje Y */}
              <div className="absolute left-2 top-2 bottom-2 flex flex-col justify-between">
                {[10, 20, 30, 40, 50, 60, 70].map((val) => (
                  <span key={val} className="text-xs text-gray-500 font-medium leading-tight">
                    {val}
                  </span>
                ))}
              </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

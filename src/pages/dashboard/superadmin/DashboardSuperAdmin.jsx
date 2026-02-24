"use client"
import { useState, useRef, useEffect } from "react"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useContextoAuth } from "@/contexts/ContextoAuth"
import {
  ArrowUpRight,
  MoreVertical,
  Check,
  Building2,
  Users,
  CreditCard,
  Activity,
  TrendingUp,
  Store,
  ShieldCheck,
  DollarSign
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import nameSub from "@/assets/subs/name_sub.svg"

export default function DashboardSuperAdmin() {
  const { usuarioActual } = useContextoAuth()
  const [openMenus, setOpenMenus] = useState({})
  const [tooltip, setTooltip] = useState(null)
  const [fechaActual, setFechaActual] = useState(new Date())
  const menuRefs = useRef({})
  const [cargando, setCargando] = useState(true)
  
  // Estado para datos reales
  const [stats, setStats] = useState({
    totalTiendas: 0,
    ingresosMRR: 0,
    usuariosTotales: 0,
    suscripcionesActivas: 0,
    tiendasRecientes: [],
    planesPopulares: [],
    growthData: []
  })

  // Cargar datos reales de Firebase
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)
        
        // 1. Obtener Tiendas
        const tiendasRef = collection(db, "tiendas")
        const tiendasSnap = await getDocs(tiendasRef)
        const tiendas = tiendasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        // 2. Obtener Usuarios (total global aproximado o exacto)
        // Nota: Si hay muchos usuarios, esto puede ser costoso. Para MVP está bien.
        const usuariosRef = collection(db, "usuarios")
        const usuariosSnap = await getDocs(usuariosRef) // O usar count() si está disponible en v9
        
        // 3. Calcular Métricas
        const totalTiendas = tiendas.length
        const usuariosTotales = usuariosSnap.size
        const suscripcionesActivas = tiendas.filter(t => t.estado === "activa").length
        
        // MRR estimado (precios hardcoded por ahora, idealmente vendrían de una config)
        const precios = { basic: 29, professional: 49, enterprise: 99 }
        const ingresosMRR = tiendas.reduce((acc, t) => {
          if (t.estado === "activa") {
            return acc + (precios[t.plan] || 0)
          }
          return acc
        }, 0)

        // 4. Tiendas Recientes (ordenar por fechaCreacion si existe)
        const tiendasOrdenadas = [...tiendas].sort((a, b) => {
          const dateA = a.fechaCreacion?.seconds || 0
          const dateB = b.fechaCreacion?.seconds || 0
          return dateB - dateA
        }).slice(0, 5)

        // 5. Planes Populares
        const conteoPlanes = tiendas.reduce((acc, t) => {
          const plan = t.plan || "unknown"
          acc[plan] = (acc[plan] || 0) + 1
          return acc
        }, {})
        
        const planesPopulares = Object.entries(conteoPlanes).map(([nombre, cantidad]) => ({
          nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
          cantidad,
          porcentaje: Math.round((cantidad / totalTiendas) * 100) || 0,
          color: nombre === "enterprise" ? "bg-purple-600" : nombre === "professional" ? "bg-blue-600" : "bg-orange-500"
        })).sort((a, b) => b.cantidad - a.cantidad)

        // 6. Growth Data (Tiendas por mes - últimos 6 meses)
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date()
          d.setMonth(d.getMonth() - i)
          return d
        }).reverse()

        const growthData = last6Months.map(date => {
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`
          const count = tiendas.filter(t => {
            if (!t.fechaCreacion) return false
            const d = new Date(t.fechaCreacion.seconds * 1000)
            return `${d.getFullYear()}-${d.getMonth()}` === monthKey
          }).length
          
          return {
            month: date.toLocaleString('default', { month: 'short' }),
            tiendas: count,
            height: count * 20 // Escala simple para visualización
          }
        })

        setStats({
          totalTiendas,
          ingresosMRR,
          usuariosTotales,
          suscripcionesActivas,
          tiendasRecientes: tiendasOrdenadas,
          planesPopulares,
          growthData
        })

      } catch (error) {
        console.error("Error cargando dashboard superadmin:", error)
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [])

  // Actualizar fecha en tiempo real
  useEffect(() => {
    const intervalo = setInterval(() => {
      setFechaActual(new Date())
    }, 1000)

    return () => clearInterval(intervalo)
  }, [])

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

  // KPIs adaptados para SuperAdmin
  const kpis = [
    {
      titulo: "Total Tiendas",
      valor: stats.totalTiendas.toString(),
      cambio: "+0", // Sin histórico real
      bgColor: "rgb(115, 58, 234)",
      graficoColor: "#733AEA",
      tipoGrafico: "linea",
      icono: Store
    },
    {
      titulo: "MRR (Ingresos Recurrentes)",
      valor: `€${(stats.ingresosMRR).toLocaleString()}`,
      cambio: "+0",
      bgColor: "rgb(5, 142, 252)",
      graficoColor: "#058EFC",
      tipoGrafico: "linea",
      icono: DollarSign
    },
    {
      titulo: "Usuarios Totales",
      valor: stats.usuariosTotales.toString(),
      cambio: "+0",
      bgColor: "rgb(253, 151, 34)",
      graficoColor: "#FD9722",
      tipoGrafico: "barras",
      icono: Users
    },
    {
      titulo: "Suscripciones Activas",
      valor: stats.suscripcionesActivas.toString(),
      cambio: "+0",
      bgColor: "rgb(242, 66, 110)",
      graficoColor: "#F2426E",
      tipoGrafico: "linea",
      icono: ShieldCheck
    },
  ]

  // Valores para mini gráficos
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
    <div className="space-y-6 min-h-full px-18 pt-0">
      {/* SVG Decorativos encima de los cards con texto superpuesto */}
      {usuarioActual && (
        <div className="relative mb-4 w-full">
          <img 
            src={nameSub} 
            alt="Decoración nombre" 
            className="h-[180px] md:h-[200px] lg:h-[220px] w-auto object-contain"
            style={{ display: 'block', margin: 0, padding: 0, lineHeight: 0, flexShrink: 0 }}
          />
          
          {/* Texto superpuesto sobre la imagen */}
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center pl-6 md:pl-8 text-white">
            {/* Último inicio de sesión */}
            <div className="mb-2">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs">
                Último Inicio de Sesión: {fechaActual.toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>

            {/* Mensaje de bienvenida */}
            <h2 className="text-xl md:text-2xl lg:text-3xl mb-2">
              Bienvenido, <span className="font-normal">{usuarioActual.nombre || 'Super Admin'}</span>
            </h2>

            {/* Información adicional */}
            <div className="flex flex-col text-sm md:text-base">
              <div className="mb-1">
                <span className="font-semibold">Rol:</span> <span className="font-normal">Super Administrador</span>
              </div>
              <div>
                <span className="font-semibold">Panel:</span> <span className="font-normal">Gestión Global</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Cards */}
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
                  <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100">
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4 text-blue-600" />
                    </span>
                    Hoy
                  </div>
                  <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100">
                    Esta Semana
                  </div>
                  <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100">
                    Este Mes
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
                <div className="flex items-center gap-1.5">
                  <kpi.icono className="h-3.5 w-3.5 text-white/90" />
                  <p className="text-xs font-medium text-white/90 leading-tight">{kpi.titulo}</p>
                </div>
              </div>
              {/* Mini gráfico interno */}
              <div className="mt-3 h-16 relative -mx-4 px-4">
                {kpi.tipoGrafico === "linea" ? (
                  <svg width="100%" height="64" className="overflow-visible" viewBox="0 0 300 64" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`gradient-sa-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="white" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="white" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={generarPuntosAreaMejorado(valoresGrafico.linea, 70, 64, 300)}
                      fill={`url(#gradient-sa-${index})`}
                    />
                    <polyline
                      points={generarPuntosLineaMejorado(valoresGrafico.linea, 70, 64, 300)}
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <div className="flex items-end gap-1 h-full">
                    {valoresGrafico.barras.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-white/50 rounded-t hover:bg-white/70 transition-all cursor-pointer"
                        style={{ height: `${(h / 70) * 100}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos Principales y Listados */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Crecimiento de Tiendas */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Crecimiento de Plataforma</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs text-gray-600 hover:bg-gray-100 h-7 px-3">Semana</Button>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 h-7 px-3 border-b-2 border-blue-600">Mensual</Button>
            </div>
          </CardHeader>
          <CardContent>
             <div className="h-64 flex items-end justify-between px-4 pb-4 pt-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                {stats.growthData.length > 0 ? (
                  stats.growthData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 w-full">
                      <div 
                        className="w-8 bg-blue-500 rounded-t-sm transition-all duration-500 ease-out hover:bg-blue-600 relative group"
                        style={{ height: `${Math.max(data.height, 4)}px` }} // Altura mínima visual
                      >
                         <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {data.tiendas} tiendas
                         </div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium uppercase">{data.month}</span>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-sm text-gray-500">Sin datos suficientes</p>
                  </div>
                )}
             </div>
          </CardContent>
        </Card>

        {/* Planes Populares */}
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Planes Populares</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.planesPopulares.map((plan, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${plan.color}`}>
                        {plan.nombre[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{plan.nombre}</p>
                        <p className="text-xs text-gray-500 leading-tight">{plan.cantidad} tiendas</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 leading-tight">{plan.porcentaje}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${plan.color} transition-all`}
                      style={{ width: `${plan.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimas Tiendas Registradas */}
      <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Últimas Tiendas Registradas</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
            Ver todas
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.tiendasRecientes.map((tienda) => (
              <div key={tienda.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 leading-tight mb-1">{tienda.nombre}</p>
                    <p className="text-xs text-gray-500 leading-tight">
                      Registrada el {tienda.fechaCreacion?.seconds 
                        ? new Date(tienda.fechaCreacion.seconds * 1000).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                  <Badge className={`text-xs font-medium ${
                    tienda.estado === 'activa' ? 'bg-green-100 text-green-800' :
                    tienda.estado === 'suspendida' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tienda.estado || 'pendiente'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-gray-600 font-medium capitalize">Plan: {tienda.plan || 'basic'}</div>
                  <div className="text-xs font-bold text-gray-900">
                    {tienda.plan === 'enterprise' ? '€99/mo' : 
                     tienda.plan === 'professional' ? '€49/mo' : '€29/mo'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

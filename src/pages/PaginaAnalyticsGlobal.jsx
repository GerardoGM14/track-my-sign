import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { CalendarDateRangePicker } from "../components/ui/date-range-picker"
import { useContextoAuth } from "../contexts/ContextoAuth"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Calendar } from "lucide-react"

// --- Componentes de Gráficos SVG Personalizados (Estilizados) ---

const DonutChart = ({ data, size = 180, thickness = 40, centerText }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0)
  let currentAngle = 0
  
  // We use a fixed viewBox size for calculations, but render responsively.
  const viewBoxSize = 200
  const center = viewBoxSize / 2
  const radius = (viewBoxSize - thickness) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full min-h-[300px]">
      <div className="relative w-[200px] h-[200px] flex-shrink-0">
        <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full transform -rotate-90">
          {data.map((item, index) => {
            const percentage = item.value / total
            const angle = percentage * 360
            const strokeDasharray = `${percentage * circumference} ${circumference}`
            const strokeDashoffset = -1 * (currentAngle / 360) * circumference
            
            const circle = (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={thickness}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80"
              />
            )
            currentAngle += angle
            return circle
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           {centerText ? centerText : (
             <>
              <span className="text-3xl font-bold text-gray-900">{total}</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</span>
             </>
           )}
        </div>
      </div>

      <div className="flex flex-col justify-center w-full max-w-sm mx-auto">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</span>
              </div>
              <div className="flex items-baseline gap-2 pl-4.5">
                <span className="text-xl font-bold text-gray-900">{item.value}</span>
                <span className="text-xs font-medium text-gray-400">({Math.round((item.value / total) * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const StackedBarChart = ({ data, keys, colors }) => {
  const maxVal = Math.max(
    ...data.map(d => keys.reduce((acc, k) => acc + d[k], 0))
  ) * 1.1

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-end gap-4 mb-6">
         {keys.map((key, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }}></div>
            <span className="text-sm text-gray-600 capitalize font-medium">{key}</span>
          </div>
        ))}
      </div>
      
      <div className="flex-1 relative w-full min-h-[150px]">
        {/* Y-Axis Labels & Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
          {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => (
            <div key={i} className="flex items-center w-full h-0 relative">
              <span className="absolute left-0 w-8 text-right text-xs text-gray-400 font-medium -translate-y-1/2">
                {Math.round(maxVal * tick)}
              </span>
              <div className="w-full border-b border-gray-100 ml-12"></div>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-around pl-12 pt-2 pb-0 z-10">
          {data.map((item, i) => {
            const totalValue = keys.reduce((acc, k) => acc + item[k], 0)
            const barHeightPercent = (totalValue / maxVal) * 100
            
            return (
              <div key={i} className="h-full flex flex-col justify-end w-full max-w-[60px] px-2 group">
                <div 
                   className="w-full rounded-md overflow-hidden flex flex-col-reverse relative transition-transform hover:scale-105 shadow-sm"
                   style={{ height: `${barHeightPercent}%` }}
                >
                  {keys.map((key, kIndex) => {
                    const val = item[key]
                    const segmentHeightPercent = (val / totalValue) * 100
                    return (
                      <div
                        key={key}
                        style={{ 
                          height: `${segmentHeightPercent}%`,
                          backgroundColor: colors[kIndex]
                        }}
                        className="w-full"
                        title={`${key}: ${val}`}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="flex justify-around mt-4 pl-12 text-sm text-gray-500 font-bold">
        {data.map((item, i) => (
          <div key={i} className="w-full text-center truncate">{item.name}</div>
        ))}
      </div>
    </div>
  )
}

const FullStackedBarChart = ({ data, keys, colors }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-end justify-around relative">
        {data.map((item, i) => {
          const total = keys.reduce((acc, k) => acc + item[k], 0)
          return (
            <div key={i} className="h-full w-full max-w-[24px] md:max-w-[32px] flex flex-col justify-end px-1">
              <div className="h-full w-full rounded-sm overflow-hidden flex flex-col-reverse bg-gray-100">
                {keys.map((key, kIndex) => {
                  const val = item[key]
                  const percent = (val / total) * 100
                  return (
                    <div
                      key={key}
                      style={{ 
                        height: `${percent}%`,
                        backgroundColor: colors[kIndex]
                      }}
                      className="w-full hover:opacity-90 transition-opacity"
                      title={`${key}: ${percent.toFixed(1)}%`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-around mt-2 text-[10px] md:text-xs text-gray-500 font-medium">
        {data.map((item, i) => (
          <div key={i} className="w-full text-center truncate px-0.5">{item.name}</div>
        ))}
      </div>
       <div className="flex justify-center gap-3 mt-4 flex-wrap">
        {keys.map((key, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i] }}></div>
            <span className="text-xs text-gray-500 capitalize">{key}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const TransactionTable = () => {
  const transactions = [
    { id: 1, date: "06/01/2026", plan: "Empresarial", status: 95, amount: "€1,200", user: "Imprenta Color" },
    { id: 2, date: "06/01/2026", plan: "Profesional", status: 80, amount: "€850", user: "Rótulos Madrid" },
    { id: 3, date: "06/01/2026", plan: "Básico", status: 100, amount: "€450", user: "Diseños Express" },
    { id: 4, date: "05/01/2026", plan: "Empresarial", status: 90, amount: "€1,200", user: "Gran Formato SL" },
    { id: 5, date: "05/01/2026", plan: "Profesional", status: 60, amount: "€850", user: "Vinilos & Más" },
  ]

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
          <tr>
            <th className="px-6 py-3 font-medium">#</th>
            <th className="px-6 py-3 font-medium">Fecha</th>
            <th className="px-6 py-3 font-medium">Plan / Turno</th>
            <th className="px-6 py-3 font-medium w-1/3">Ratio de Eficiencia</th>
            <th className="px-6 py-3 font-medium text-right">Monto</th>
            <th className="px-6 py-3 font-medium">Cliente</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 text-gray-500">{t.id}</td>
              <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                <span className="text-gray-400"><Calendar className="w-4 h-4" /></span> 
                <div>
                  <div className="text-sm">{t.date}</div>
                  <div className="text-xs text-gray-400 font-normal">20 Ene, 2026 - 09 Feb, 2026</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="secondary" className={`
                  ${t.plan === 'Empresarial' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                  ${t.plan === 'Profesional' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : ''}
                  ${t.plan === 'Básico' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : ''}
                `}>
                  {t.plan.toUpperCase()}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                   <div style={{ width: `${t.status}%` }} className="h-full bg-emerald-400"></div>
                   <div style={{ width: `${100 - t.status}%` }} className="h-full bg-orange-400"></div>
                </div>
              </td>
              <td className="px-6 py-4 font-bold text-gray-900 text-right">{t.amount}</td>
              <td className="px-6 py-4 text-gray-600">{t.user}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


export default function PaginaAnalyticsGlobal() {
  const { usuarioActual } = useContextoAuth()
  
  // Estados para filtros
  const [selectedLocation, setSelectedLocation] = useState("TODOS")
  const [selectedShift, setSelectedShift] = useState("TODOS")
  
  // Datos Mocks
  const dataPlanes = [
    { label: "Empresarial", value: 156, color: "#3B82F6" }, // blue-500
    { label: "Profesional", value: 342, color: "#10B981" }, // emerald-500
    { label: "Básico", value: 245, color: "#9CA3AF" }, // gray-400
    { label: "Cancelados", value: 42, color: "#EF4444" }, // red-500
  ]

  const dataIngresos = [
    { name: "07/01", suscripciones: 300, addons: 60 },
    { name: "08/01", suscripciones: 380, addons: 55 },
    { name: "09/01", suscripciones: 400, addons: 70 },
  ]

  const dataEficiencia = [
    { name: "Mañana", online: 85, offline: 10, undef: 5 },
    { name: "Tarde", online: 90, offline: 5, undef: 5 },
    { name: "Noche", online: 82, offline: 15, undef: 3 },
  ]
  
  const dataMensual = [
    { name: "Ene", online: 85, offline: 10, undef: 5 },
    { name: "Feb", online: 88, offline: 8, undef: 4 },
    { name: "Mar", online: 86, offline: 12, undef: 2 },
    { name: "Abr", online: 85, offline: 10, undef: 5 },
    { name: "May", online: 88, offline: 8, undef: 4 },
    { name: "Jun", online: 86, offline: 12, undef: 2 },
    { name: "Jul", online: 85, offline: 10, undef: 5 },
    { name: "Ago", online: 88, offline: 8, undef: 4 },
    { name: "Set", online: 86, offline: 12, undef: 2 },
    { name: "Oct", online: 85, offline: 10, undef: 5 },
    { name: "Nov", online: 88, offline: 8, undef: 4 },
    { name: "Dic", online: 86, offline: 12, undef: 2 },
  ]

  return (
    <div className="flex flex-col px-18 pt-4 pb-4 font-sans bg-gray-50/50 min-h-screen">
      
      {/* Top Bar */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Analytics Global</h1>
          <p className="text-gray-500 mt-1">Vista general de rendimiento y métricas clave.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
           <div className="bg-white rounded-md border shadow-sm">
             <CalendarDateRangePicker className="border-none text-sm" />
           </div>
           
           <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[140px] bg-white border-gray-200">
              <SelectValue placeholder="Ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">TODOS</SelectItem>
              <SelectItem value="Madrid">Madrid</SelectItem>
              <SelectItem value="Barcelona">Barcelona</SelectItem>
            </SelectContent>
           </Select>

           <Select value={selectedShift} onValueChange={setSelectedShift}>
            <SelectTrigger className="w-[140px] bg-white border-gray-200">
              <SelectValue placeholder="Turno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">TODOS</SelectItem>
              <SelectItem value="Mañana">Mañana</SelectItem>
              <SelectItem value="Tarde">Tarde</SelectItem>
            </SelectContent>
           </Select>
        </div>
      </div>

      <div className="space-y-6">
      {/* Row 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Donut */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900">Estado de Suscripciones</CardTitle>
            <CardDescription>Distribución actual por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart 
              data={dataPlanes} 
              centerText={
                <div className="text-center">
                  <span className="block text-2xl font-bold text-gray-900">856</span>
                  <span className="text-xs text-gray-500 font-bold uppercase">Activos</span>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Right: Stacked Bar */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
             <div>
              <CardTitle className="text-base font-bold text-gray-900">Tendencia de Ingresos</CardTitle>
              <CardDescription>Evolución últimos días</CardDescription>
             </div>
             {/* Legend handled inside chart or here */}
          </CardHeader>
          <CardContent className="h-[300px]">
            <StackedBarChart 
              data={dataIngresos}
              keys={["suscripciones", "addons"]}
              colors={["#10B981", "#F97316"]} // Emerald, Orange
            />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Efficiency Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-white">
           <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900">Eficiencia por Turno</CardTitle>
            <CardDescription>Comparativo porcentual de uso</CardDescription>
           </CardHeader>
           <CardContent className="h-[300px]">
             <FullStackedBarChart 
               data={dataEficiencia}
               keys={["online", "offline", "undef"]}
               colors={["#10B981", "#F97316", "#6B7280"]}
             />
           </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
           <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900">% Eficiencia Mensual</CardTitle>
            <CardDescription>Comparativo porcentual anual</CardDescription>
           </CardHeader>
           <CardContent className="h-[300px]">
             <FullStackedBarChart 
               data={dataMensual}
               keys={["online", "offline", "undef"]}
               colors={["#10B981", "#F97316", "#6B7280"]}
             />
           </CardContent>
        </Card>
      </div>

      {/* Row 4: Table */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-white pb-4 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-900">Registros Consolidados</CardTitle>
          <CardDescription>Últimas transacciones y cambios de estado</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionTable />
        </CardContent>
      </Card>
      
      </div>
    </div>
  )
}
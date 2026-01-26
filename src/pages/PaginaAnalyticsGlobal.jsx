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

const DonutChart = ({ data, size = 180, thickness = 25, centerText }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0)
  let currentAngle = 0
  const radius = (size - thickness) / 2
  const center = size / 2

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-full">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, index) => {
            const percentage = item.value / total
            const angle = percentage * 360
            
            const strokeWidth = thickness
            const circleRadius = (size - strokeWidth) / 2
            const circumference = 2 * Math.PI * circleRadius
            const strokeDasharray = `${percentage * circumference} ${circumference}`
            const strokeDashoffset = -1 * (currentAngle / 360) * circumference

            const circle = (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={circleRadius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${center} ${center})`}
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
              <span className="text-2xl font-bold text-gray-900">{total}</span>
              <span className="text-xs text-gray-500 font-medium">Total</span>
             </>
           )}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-3">
        <div className="grid grid-cols-[auto_auto_auto] gap-x-6 gap-y-2 text-sm">
          <div className="font-semibold text-gray-400 mb-1">Estado</div>
          <div className="font-semibold text-gray-400 mb-1 text-right">%</div>
          <div className="font-semibold text-gray-400 mb-1 text-right">cant.</div>
          
          {data.map((item, index) => (
            <>
              <div className="flex items-center gap-2" key={`l-${index}`}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-700 font-medium">{item.label}</span>
              </div>
              <div className="text-right font-bold text-gray-900" key={`p-${index}`}>
                {Math.round((item.value / total) * 100)}
              </div>
              <div className="text-right text-gray-500" key={`v-${index}`}>
                {item.value}
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

const StackedBarChart = ({ data, keys, colors, height = 250 }) => {
  const maxVal = Math.max(
    ...data.map(d => keys.reduce((acc, k) => acc + d[k], 0))
  ) * 1.1

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-end gap-4 mb-4">
         {keys.map((key, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i] }}></div>
            <span className="text-xs text-gray-500 capitalize font-medium">{key}</span>
          </div>
        ))}
      </div>
      
      <div className="flex-1 relative w-full">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400 pointer-events-none z-0">
          {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => (
            <div key={i} className="flex items-center w-full border-b border-gray-100 last:border-0 h-0 relative">
              <span className="absolute -left-10 w-8 text-right text-[10px]">{Math.round(maxVal * tick)}</span>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-around pl-0 pt-2 pb-0 z-10">
          {data.map((item, i) => {
            const totalHeight = keys.reduce((acc, k) => acc + item[k], 0)
            return (
              <div key={i} className="h-full flex flex-col justify-end w-full max-w-[40px] px-1 group">
                <div className="w-full rounded-sm overflow-hidden flex flex-col-reverse relative transition-transform hover:scale-105">
                  {keys.map((key, kIndex) => {
                    const val = item[key]
                    return (
                      <div
                        key={key}
                        style={{ 
                          height: `${(val / maxVal) * 100 * (height/250)}%`, // Scale fix
                          backgroundColor: colors[kIndex],
                          flexBasis: `${(val / totalHeight) * 100}%` 
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
      
      <div className="flex justify-around mt-3 text-xs text-gray-500 font-bold">
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
    { name: "05/01", suscripciones: 340, addons: 50 },
    { name: "06/01", suscripciones: 350, addons: 45 },
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
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6 font-sans">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics Global</h1>
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

      {/* Row 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Donut */}
        <Card className="lg:col-span-1 border-none shadow-sm">
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
        <Card className="lg:col-span-2 border-none shadow-sm">
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
        <Card className="border-none shadow-sm">
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

        <Card className="border-none shadow-sm">
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
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white pb-4 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-900">Registros Consolidados</CardTitle>
          <CardDescription>Últimas transacciones y cambios de estado</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionTable />
        </CardContent>
      </Card>

    </div>
  )
}
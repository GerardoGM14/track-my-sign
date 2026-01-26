import { useState } from "react"
import { Search, MoreVertical, Store, Plus } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"

export default function PaginaGestionTiendas() {
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  // Mock data para tiendas
  const tiendas = [
    {
      id: "1",
      nombre: "Imprenta Rápida Express",
      slug: "imprenta-rapida",
      propietario: "Carlos Rodríguez",
      email: "carlos@imprentarapida.com",
      plan: "Empresarial",
      estado: "activa",
      fechaRegistro: "24/01/2024",
      ingresos: 120,
    },
    {
      id: "2",
      nombre: "Rotulación Moderna SL",
      slug: "rotulacion-moderna",
      propietario: "Ana García",
      email: "ana@rotulacionmoderna.com",
      plan: "Profesional",
      estado: "activa",
      fechaRegistro: "23/01/2024",
      ingresos: 80,
    },
    {
      id: "3",
      nombre: "Gráficas del Norte",
      slug: "graficas-norte",
      propietario: "Miguel Ángel",
      email: "miguel@graficasnorte.com",
      plan: "Básico",
      estado: "pendiente",
      fechaRegistro: "22/01/2024",
      ingresos: 40,
    },
    {
      id: "4",
      nombre: "Diseño y Corte Digital",
      slug: "diseno-corte",
      propietario: "Laura Martínez",
      email: "laura@disenocorte.com",
      plan: "Profesional",
      estado: "suspendida",
      fechaRegistro: "15/01/2024",
      ingresos: 80,
    },
    {
      id: "5",
      nombre: "Print & Go",
      slug: "print-go",
      propietario: "Roberto Sánchez",
      email: "roberto@printgo.com",
      plan: "Empresarial",
      estado: "activa",
      fechaRegistro: "10/01/2024",
      ingresos: 120,
    },
  ]

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "activa":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Activa</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">Pendiente</Badge>
      case "suspendida":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Suspendida</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const tiendasFiltradas = tiendas.filter(tienda => {
    const coincideBusqueda = tienda.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                             tienda.email.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === "todos" || tienda.estado === filtroEstado
    return coincideBusqueda && coincideEstado
  })

  return (
    <div className="flex flex-col max-h-[calc(100vh-220px)] px-18 pt-4 pb-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Gestión de Tiendas</h1>
        
        <div className="flex items-center gap-3">
          {/* Barra de búsqueda */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar tienda..."
              className="pl-10 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Filtro de Estado */}
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[180px] bg-white border-gray-300 rounded-lg">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="activa">Activa</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="suspendida">Suspendida</SelectItem>
            </SelectContent>
          </Select>

          {/* Botón Nueva Tienda */}
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Nueva Tienda
          </Button>
        </div>
      </div>

      {/* Card con la tabla */}
      <Card className="border border-gray-200 rounded-xl shadow-md bg-white overflow-hidden flex-1 flex flex-col min-h-0">
        <CardContent className="p-0 flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium w-[40px]">
                   <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="px-6 py-3 font-medium">Tienda</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Propietario</th>
                <th className="px-6 py-3 font-medium">Plan</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">Registro</th>
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tiendasFiltradas.map((tienda) => (
                <tr key={tienda.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                     <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{tienda.nombre}</div>
                    <div className="text-xs text-gray-500 md:hidden">{tienda.email}</div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="font-medium text-gray-900">{tienda.propietario}</div>
                    <div className="text-xs text-gray-500">{tienda.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-700">
                      {tienda.plan}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{getEstadoBadge(tienda.estado)}</td>
                  <td className="px-6 py-4 hidden sm:table-cell text-gray-500">{tienda.fechaRegistro}</td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                          <span className="sr-only">Abrir menú</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                        <DropdownMenuItem>Editar suscripción</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Suspender tienda</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {tiendasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron tiendas que coincidan con tu búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

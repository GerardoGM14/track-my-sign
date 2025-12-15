"use client"
import { useLocation, useParams } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  DollarSign,
  FileText,
  ClipboardList,
  Users,
  Receipt,
  Settings,
  UserPlus,
  Building2,
  BarChart3,
  Shield,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "../contexts/ContextoAuth"
import { NavLinkViewTransition } from "./NavLinkViewTransition"

export default function SidebarTienda() {
  const location = useLocation()
  const { slugTienda } = useParams()
  const { usuario } = useAuth()

  const obtenerElementosMenu = () => {
    const elementosBase = [
      {
        titulo: "Dashboard",
        url: `/${slugTienda}`,
        icono: LayoutDashboard,
        roles: ["admin", "employee", "customer"],
      },
    ]

    const elementosAdmin = [
      {
        titulo: "Productos",
        url: `/${slugTienda}/productos`,
        icono: Package,
        roles: ["admin", "employee"],
      },
      {
        titulo: "Precios",
        url: `/${slugTienda}/precios`,
        icono: DollarSign,
        roles: ["admin", "employee"],
      },
      {
        titulo: "Cotizaciones",
        url: `/${slugTienda}/cotizaciones`,
        icono: FileText,
        roles: ["admin", "employee", "customer"],
      },
      {
        titulo: "Órdenes",
        url: `/${slugTienda}/ordenes`,
        icono: ClipboardList,
        roles: ["admin", "employee"],
      },
      {
        titulo: "Clientes",
        url: `/${slugTienda}/clientes`,
        icono: Users,
        roles: ["admin", "employee"],
      },
      {
        titulo: "Facturación",
        url: `/${slugTienda}/facturacion`,
        icono: Receipt,
        roles: ["admin"],
      },
    ]

    const elementosGestion = [
      {
        titulo: "Usuarios",
        url: `/${slugTienda}/usuarios`,
        icono: UserPlus,
        roles: ["admin"],
      },
      {
        titulo: "Configuración",
        url: `/${slugTienda}/configuracion`,
        icono: Settings,
        roles: ["admin"],
      },
    ]

    const elementosSuperAdmin = [
      {
        titulo: "Gestión Tiendas",
        url: "/super-admin/tiendas",
        icono: Building2,
        roles: ["superadmin"],
      },
      {
        titulo: "Analytics Global",
        url: "/super-admin/analytics",
        icono: BarChart3,
        roles: ["superadmin"],
      },
      {
        titulo: "Administración",
        url: "/super-admin/admin",
        icono: Shield,
        roles: ["superadmin"],
      },
    ]

    const todosElementos = [...elementosBase, ...elementosAdmin, ...elementosGestion, ...elementosSuperAdmin]
    return todosElementos.filter((elemento) => elemento.roles.includes(usuario?.rol || "customer"))
  }

  const elementosMenu = obtenerElementosMenu()

  const elementosPrincipales = elementosMenu.filter((item) =>
    ["Dashboard", "Productos", "Precios", "Cotizaciones", "Órdenes", "Clientes"].includes(item.titulo),
  )

  const elementosGestion = elementosMenu.filter((item) =>
    ["Facturación", "Usuarios", "Configuración"].includes(item.titulo),
  )

  const elementosSuperAdmin = elementosMenu.filter((item) =>
    ["Gestión Tiendas", "Analytics Global", "Administración"].includes(item.titulo),
  )

  return (
    <div className="flex h-[calc(100vh-3rem)] w-64 flex-col bg-[#1A202C] text-white rounded-xl shadow-2xl m-6 my-6 border border-gray-800/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700/50 rounded-t-xl flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-tight text-white">TrackMySign</span>
          <span className="text-xs text-gray-400 leading-tight">{usuario?.nombreTienda || "Mi Tienda"}</span>
        </div>
      </div>

      {/* Content - Scroll independiente */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sidebar-scroll">
        {/* DASHBOARDS */}
        <div className="mb-6">
          <div className="px-3 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">DASHBOARDS</span>
          </div>
          <div className="space-y-1">
            {elementosPrincipales.map((item) => {
              const IconoComponente = item.icono
              const estaActivo = location.pathname === item.url

              return (
                <NavLinkViewTransition
                  key={item.titulo}
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors leading-tight ${
                    estaActivo
                      ? "bg-[#2D3748] text-white shadow-sm"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`}
                >
                  <IconoComponente className="h-4 w-4" />
                  <span className="leading-tight">{item.titulo}</span>
                </NavLinkViewTransition>
              )
            })}
          </div>
        </div>

        {/* APPLICATIONS */}
        {elementosGestion.length > 0 && (
          <div className="mb-6">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">APLICACIONES</span>
            </div>
            <div className="space-y-1">
              {elementosGestion.map((item) => {
                const IconoComponente = item.icono
                const estaActivo = location.pathname === item.url

                return (
                  <NavLinkViewTransition
                    key={item.titulo}
                    to={item.url}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors leading-tight ${
                      estaActivo
                        ? "bg-[#2D3748] text-white shadow-sm"
                        : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    <IconoComponente className="h-4 w-4" />
                    <span className="leading-tight">{item.titulo}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                  </NavLinkViewTransition>
                )
              })}
            </div>
          </div>
        )}

        {/* SUPER ADMIN */}
        {elementosSuperAdmin.length > 0 && (
          <div className="mb-6">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">ADMINISTRACIÓN</span>
            </div>
            <div className="space-y-1">
              {elementosSuperAdmin.map((item) => {
                const IconoComponente = item.icono
                const estaActivo = location.pathname === item.url

                return (
                  <NavLinkViewTransition
                    key={item.titulo}
                    to={item.url}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors leading-tight ${
                      estaActivo
                        ? "bg-[#2D3748] text-white shadow-sm"
                        : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    <IconoComponente className="h-4 w-4" />
                    <span className="leading-tight">{item.titulo}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                  </NavLinkViewTransition>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700/50 px-4 py-4 rounded-b-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
            <span className="text-xs font-semibold text-white">
              {usuario?.nombre?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium text-white truncate leading-tight">{usuario?.nombre || "Usuario"}</span>
            <span className="text-xs text-gray-400 capitalize truncate leading-tight">{usuario?.rol || "customer"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

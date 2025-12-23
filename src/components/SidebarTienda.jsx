"use client"
import { useLocation, useParams } from "react-router-dom"
import { useEffect, useRef } from "react"
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
  Layers,
  X,
} from "lucide-react"
import { useAuth } from "../contexts/ContextoAuth"
import { NavLinkViewTransition } from "./NavLinkViewTransition"

export default function SidebarTienda({ onClose }) {
  const location = useLocation()
  const { slugTienda } = useParams()
  const { usuario } = useAuth()
  const sidebarScrollRef = useRef(null)

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
        titulo: "Maestros",
        url: `/${slugTienda}/maestros`,
        icono: Layers,
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

  // Dashboard principal
  const elementosDashboard = elementosMenu.filter((item) =>
    ["Dashboard"].includes(item.titulo),
  )

  // Operaciones del día a día
  const elementosOperaciones = elementosMenu.filter((item) =>
    ["Productos", "Precios", "Cotizaciones", "Órdenes", "Clientes"].includes(item.titulo),
  )

  // Administración y configuración
  const elementosAdministracion = elementosMenu.filter((item) =>
    ["Facturación", "Usuarios", "Maestros", "Configuración"].includes(item.titulo),
  )

  const elementosSuperAdmin = elementosMenu.filter((item) =>
    ["Gestión Tiendas", "Analytics Global", "Administración"].includes(item.titulo),
  )

  // Detectar scroll en el sidebar para mostrar scrollbar
  useEffect(() => {
    const sidebarScroll = sidebarScrollRef.current
    if (!sidebarScroll) return

    let scrollTimeout

    const handleScroll = () => {
      // Agregar clase "scrolling" cuando se hace scroll
      sidebarScroll.classList.add("scrolling")
      
      // Limpiar timeout anterior
      clearTimeout(scrollTimeout)
      
      // Remover clase "scrolling" después de 1 segundo sin scroll
      scrollTimeout = setTimeout(() => {
        sidebarScroll.classList.remove("scrolling")
      }, 1000)
    }

    sidebarScroll.addEventListener("scroll", handleScroll)
    return () => {
      sidebarScroll.removeEventListener("scroll", handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return (
    <div className="flex h-full lg:h-[calc(100vh-3rem)] w-64 lg:w-64 flex-col bg-[#1A202C] text-white lg:rounded-xl shadow-2xl lg:m-6 lg:my-6 border-r lg:border border-gray-800/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700/50 lg:rounded-t-xl flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-purple-600 flex-shrink-0">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-bold leading-tight text-white truncate">TrackMySign</span>
            <span className="text-[10px] sm:text-xs text-gray-400 leading-tight truncate">{usuario?.nombreTienda || "Mi Tienda"}</span>
          </div>
        </div>
        {/* Botón cerrar en móvil */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Content - Scroll independiente */}
      <div ref={sidebarScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sidebar-scroll">
        {/* DASHBOARD */}
        {elementosDashboard.length > 0 && (
          <div className="mb-6">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">DASHBOARD</span>
            </div>
            <div className="space-y-1">
              {elementosDashboard.map((item) => {
                const IconoComponente = item.icono
                const estaActivo = location.pathname === item.url

                return (
                  <NavLinkViewTransition
                    key={item.titulo}
                    to={item.url}
                    onClick={onClose}
                    className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors leading-tight ${
                      estaActivo
                        ? "bg-[#2D3748] text-white shadow-sm"
                        : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    <IconoComponente className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="leading-tight truncate">{item.titulo}</span>
                  </NavLinkViewTransition>
                )
              })}
            </div>
          </div>
        )}

        {/* OPERACIONES */}
        {elementosOperaciones.length > 0 && (
          <div className="mb-6">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">OPERACIONES</span>
            </div>
            <div className="space-y-1">
              {elementosOperaciones.map((item) => {
                const IconoComponente = item.icono
                const estaActivo = location.pathname === item.url

                return (
                  <NavLinkViewTransition
                    key={item.titulo}
                    to={item.url}
                    onClick={onClose}
                    className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors leading-tight ${
                      estaActivo
                        ? "bg-[#2D3748] text-white shadow-sm"
                        : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    <IconoComponente className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="leading-tight truncate">{item.titulo}</span>
                  </NavLinkViewTransition>
                )
              })}
            </div>
          </div>
        )}

        {/* ADMINISTRACIÓN */}
        {elementosAdministracion.length > 0 && (
          <div className="mb-6">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">ADMINISTRACIÓN</span>
            </div>
            <div className="space-y-1">
              {elementosAdministracion.map((item) => {
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
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-auto text-gray-400 flex-shrink-0" />
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
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-auto text-gray-400 flex-shrink-0" />
                  </NavLinkViewTransition>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700/50 px-3 sm:px-4 py-3 sm:py-4 lg:rounded-b-xl flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-700 flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-semibold text-white">
              {usuario?.nombre?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs sm:text-sm font-medium text-white truncate leading-tight">{usuario?.nombre || "Usuario"}</span>
            <span className="text-[10px] sm:text-xs text-gray-400 capitalize truncate leading-tight">{usuario?.rol || "customer"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

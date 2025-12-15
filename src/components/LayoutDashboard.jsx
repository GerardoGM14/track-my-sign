"use client"
import SidebarTienda from "./SidebarTienda"
import { MessageSquare, Bell, Globe, User, Settings, Activity, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "../contexts/ContextoAuth"
import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function LayoutDashboard({ children }) {
  const { usuario, cerrarSesion } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Función para generar breadcrumb dinámico
  const obtenerBreadcrumb = () => {
    const path = location.pathname
    const rutas = {
      "": { categoria: "Dashboards", titulo: "Gestión de Tienda" },
      "/productos": { categoria: "Apps", titulo: "Productos" },
      "/precios": { categoria: "Apps", titulo: "Precios" },
      "/cotizaciones": { categoria: "Apps", titulo: "Cotizaciones" },
      "/ordenes": { categoria: "Apps", titulo: "Órdenes" },
      "/clientes": { categoria: "Apps", titulo: "Clientes" },
      "/facturacion": { categoria: "Apps", titulo: "Facturación" },
      "/usuarios": { categoria: "Apps", titulo: "Usuarios" },
    }

    // Extraer la parte de la ruta después del slugTienda
    const partes = path.split("/")
    const rutaRelativa = partes.length > 2 ? `/${partes[2]}` : ""
    
    const rutaInfo = rutas[rutaRelativa] || { categoria: "Dashboards", titulo: "Gestión de Tienda" }
    return rutaInfo
  }

  const breadcrumb = obtenerBreadcrumb()

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserMenu])

  const handleCerrarSesion = async () => {
    await cerrarSesion()
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SidebarTienda />
      <div className="flex-1 flex flex-col overflow-hidden m-6 my-6 ml-4 mr-8">
        {/* Header Superior - Transparente y alineado */}
        <header className="bg-transparent px-6 py-4 flex items-center justify-between flex-shrink-0 mb-2">
          {/* Breadcrumb dinámico */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-400">{breadcrumb.categoria}</span>
            <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
            <span className="text-gray-900 font-medium">{breadcrumb.titulo}</span>
          </div>

          {/* Iconos del header */}
          <div className="flex items-center gap-3">
            {/* Icono de Mensajes */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <MessageSquare className="h-5 w-5" />
            </button>

            {/* Icono de Notificaciones */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-blue-600 rounded-full"></span>
            </button>

            {/* Icono de País/Idioma */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="h-5 w-7 rounded-sm overflow-hidden border border-gray-300 shadow-sm">
                <div className="h-full w-full bg-gradient-to-b from-red-500 via-white to-blue-600 flex flex-col">
                  <div className="h-1/3 bg-red-600"></div>
                  <div className="h-1/3 bg-white"></div>
                  <div className="h-1/3 bg-blue-600"></div>
                </div>
              </div>
            </button>

            {/* Icono de Perfil con Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {usuario?.nombre?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu del Usuario */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {usuario?.nombre?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                          {usuario?.nombre || "Usuario"}
                        </p>
                        <p className="text-xs text-gray-500 leading-tight truncate">
                          {usuario?.email || "usuario@ejemplo.com"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                      <User className="h-4 w-4 text-gray-500" />
                      Ver Perfil
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                      <Settings className="h-4 w-4 text-gray-500" />
                      Configuración
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                      <Activity className="h-4 w-4 text-gray-500" />
                      Actividad
                    </button>
                  </div>
                  <div className="border-t border-gray-200 py-1">
                    <button
                      onClick={handleCerrarSesion}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-gray-500" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenido del Dashboard */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden dashboard-scroll">
          <div className="flex flex-1 flex-col gap-4 px-8 pb-6 min-h-full">{children}</div>
        </div>
      </div>
    </div>
  )
}

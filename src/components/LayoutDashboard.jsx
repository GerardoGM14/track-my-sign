"use client"
import SidebarTienda from "./SidebarTienda"
import { MessageSquare, Bell, Globe, User, Settings, Activity, LogOut, ChevronDown, Menu, X, Shield } from "lucide-react"
import { useAuth } from "../contexts/ContextoAuth"
import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import mountain from "../assets/mountain.svg"
import TarjetaLicencia from "./TarjetaLicencia"

export default function LayoutDashboard({ children }) {
  const { usuario, cerrarSesion } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLicenciaModal, setShowLicenciaModal] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const menuRef = useRef(null)
  const licenciaModalRef = useRef(null)
  const scrollContainerRef = useRef(null)
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
      if (licenciaModalRef.current && !licenciaModalRef.current.contains(event.target)) {
        setShowLicenciaModal(false)
      }
    }

    if (showUserMenu || showLicenciaModal) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserMenu, showLicenciaModal])

  // Detectar scroll para cambiar el topbar y mostrar scrollbar
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    let scrollTimeout

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop
      setIsScrolled(scrollTop > 20)
      
      // Agregar clase "scrolling" cuando se hace scroll
      scrollContainer.classList.add("scrolling")
      
      // Limpiar timeout anterior
      clearTimeout(scrollTimeout)
      
      // Remover clase "scrolling" después de 1 segundo sin scroll
      scrollTimeout = setTimeout(() => {
        scrollContainer.classList.remove("scrolling")
      }, 1000)
    }

    scrollContainer.addEventListener("scroll", handleScroll)
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  const handleCerrarSesion = async () => {
    await cerrarSesion()
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-orange-50 overflow-hidden relative">
      {/* Ilustraciones decorativas al fondo con desenfoque y color plomo */}
      <img
        src={mountain}
        alt="Decoración montañosa"
        className="pointer-events-none select-none fixed bottom-0 right-0 w-[200px] sm:w-[360px] md:w-[500px] opacity-20 blur-sm z-0"
        style={{
          filter: 'grayscale(100%) brightness(0.7) contrast(1.2)',
        }}
      />
      <img
        src={mountain}
        alt="Decoración montañosa reflejada"
        className="pointer-events-none select-none fixed bottom-0 left-0 w-[200px] sm:w-[360px] md:w-[500px] opacity-20 blur-sm z-0 transform -scale-x-100"
        style={{
          filter: 'grayscale(100%) brightness(0.7) contrast(1.2)',
        }}
      />
      
      {/* Overlay para móvil cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar con estado móvil */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <SidebarTienda onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden m-0 sm:m-3 md:m-6 my-0 sm:my-3 md:my-6 ml-0 sm:ml-3 md:ml-4 mr-0 sm:mr-3 md:mr-8 relative z-10">
        {/* Header Superior - Transparente y alineado */}
        <header className="px-2 sm:px-4 md:px-8 lg:px-20 py-2 flex items-center justify-between flex-shrink-0 mb-0 bg-transparent">
          {/* Contenedor con fondo blanco redondeado que aparece al hacer scroll */}
          <div 
            className={`flex items-center justify-between w-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 ${
              isScrolled 
                ? "bg-white shadow-sm relative z-50" 
                : "bg-transparent"
            }`}
            style={{ overflow: 'visible' }}
          >
            {/* Botón menú móvil */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-2"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Breadcrumb dinámico */}
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 flex-1 min-w-0">
              <span className="text-gray-400 hidden sm:inline">{breadcrumb.categoria}</span>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 rotate-[-90deg] hidden sm:inline" />
              <span className="text-gray-900 font-medium truncate">{breadcrumb.titulo}</span>
            </div>

            {/* Iconos del header */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            {/* Botón Super Admin - solo para admins */}
            {usuario?.rol === "admin" && (
              <button
                onClick={() => navigate("/super-admin/licencias")}
                className="relative p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex items-center gap-1"
                title="Super Admin"
              >
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            
            {/* Icono de Mensajes - oculto en móvil pequeño */}
            <button 
              onClick={() => setShowLicenciaModal(true)}
              className="relative p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex"
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Icono de Notificaciones */}
            <button className="relative p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-blue-600 rounded-full"></span>
            </button>

            {/* Icono de País/Idioma - oculto en móvil */}
            <button className="relative p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden md:flex">
              <div className="h-4 w-6 sm:h-5 sm:w-7 rounded-sm overflow-hidden border border-gray-300 shadow-sm">
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
                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
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
                    <button 
                      onClick={() => slugTienda && navigate(`/${slugTienda}/perfil`)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      Ver Perfil
                    </button>
                    <button 
                      onClick={() => slugTienda && navigate(`/${slugTienda}/configuracion`)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      Configuración
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
          </div>
        </header>

        {/* Contenido del Dashboard */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden dashboard-scroll">
          <div className="flex flex-1 flex-col gap-3 sm:gap-4 px-2 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 min-h-full">{children}</div>
        </div>
      </div>

      {/* Modal de Licencia */}
      {showLicenciaModal && (
        <>
          <div 
            className="fixed inset-0 bg-gray-600/40 z-[100] transition-opacity duration-300"
            onClick={() => setShowLicenciaModal(false)}
          />
          <div
            ref={licenciaModalRef}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] bg-transparent rounded-xl shadow-2xl p-0 max-w-md w-full mx-4"
          >
            <div className="relative">
              <button
                onClick={() => setShowLicenciaModal(false)}
                className="absolute -top-2 -right-2 z-10 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
              <TarjetaLicencia />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

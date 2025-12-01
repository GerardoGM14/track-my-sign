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
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "../components/ui/sidebar"
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
        titulo: "Facturación",
        url: `/${slugTienda}/facturacion`,
        icono: Receipt,
        roles: ["admin"],
      },
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
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">TrackMySign</span>
            <span className="truncate text-xs text-muted-foreground">{usuario?.nombreTienda || "Mi Tienda"}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {elementosPrincipales.map((item) => {
                const IconoComponente = item.icono
                const estaActivo = location.pathname === item.url

                return (
                  <SidebarMenuItem key={item.titulo}>
                    <SidebarMenuButton asChild isActive={estaActivo}>
                      <NavLinkViewTransition to={item.url}>
                        <IconoComponente className="h-4 w-4" />
                        <span>{item.titulo}</span>
                      </NavLinkViewTransition>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {elementosGestion.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Gestión</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {elementosGestion.map((item) => {
                    const IconoComponente = item.icono
                    const estaActivo = location.pathname === item.url

                    return (
                      <SidebarMenuItem key={item.titulo}>
                        <SidebarMenuButton asChild isActive={estaActivo}>
                          <NavLinkViewTransition to={item.url}>
                            <IconoComponente className="h-4 w-4" />
                            <span>{item.titulo}</span>
                          </NavLinkViewTransition>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {elementosSuperAdmin.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {elementosSuperAdmin.map((item) => {
                    const IconoComponente = item.icono
                    const estaActivo = location.pathname === item.url

                    return (
                      <SidebarMenuItem key={item.titulo}>
                        <SidebarMenuButton asChild isActive={estaActivo}>
                          <NavLinkViewTransition to={item.url}>
                            <IconoComponente className="h-4 w-4" />
                            <span>{item.titulo}</span>
                            </NavLinkViewTransition>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2 text-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                <span className="text-xs font-medium">{usuario?.nombre?.charAt(0).toUpperCase() || "U"}</span>
              </div>
              <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-medium">{usuario?.nombre || "Usuario"}</span>
                <span className="truncate text-muted-foreground capitalize">{usuario?.rol || "customer"}</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

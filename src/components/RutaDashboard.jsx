"use client"
import { useAuth } from "../contexts/ContextoAuth"
import DashboardAdmin from "../pages/DashboardAdmin"
import DashboardSuperAdmin from "../pages/DashboardSuperAdmin"
import DashboardEmployee from "../pages/DashboardEmployee"
import DashboardCustomer from "../pages/DashboardCustomer"
import LayoutDashboard from "./LayoutDashboard"

export function RutaDashboard() {
  const { usuarioActual } = useAuth()

  const renderizarDashboard = () => {
    switch (usuarioActual?.rol) {
      case "superadmin":
        return <DashboardSuperAdmin />
      case "admin":
        return <DashboardAdmin />
      case "employee":
        return <DashboardEmployee />
      case "customer":
        return <DashboardCustomer />
      default:
        return <DashboardCustomer /> // Por defecto customer
    }
  }

  return <LayoutDashboard>{renderizarDashboard()}</LayoutDashboard>
}

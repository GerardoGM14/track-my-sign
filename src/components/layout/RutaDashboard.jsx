"use client"
import { useAuth } from "../../contexts/ContextoAuth"
import DashboardAdmin from "@/pages/dashboard/admin/DashboardAdmin"
import DashboardSuperAdmin from "../../pages/super-admin/DashboardSuperAdmin"
import DashboardEmployee from "@/pages/dashboard/employee/DashboardEmployee"
import DashboardCustomer from "@/pages/dashboard/customer/DashboardCustomer"
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

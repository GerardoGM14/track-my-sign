import { Navigate, useLocation } from "react-router-dom"
import { useContextoAuth } from "../contexts/ContextoAuth"

export function RutaProtegida({ children, rolRequerido }) {
  const { usuarioActual } = useContextoAuth()
  const location = useLocation()

  if (!usuarioActual) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (rolRequerido && usuarioActual.rol !== rolRequerido) {
    // Verificar jerarquía de roles
    const jerarquiaRoles = ["cliente", "empleado", "admin", "super_admin"]
    const indiceRolUsuario = jerarquiaRoles.indexOf(usuarioActual.rol)
    const indiceRolRequerido = jerarquiaRoles.indexOf(rolRequerido)

    if (indiceRolUsuario < indiceRolRequerido) {
      return <Navigate to="/no-autorizado" replace />
    }
  }

  return <>{children}</>
}

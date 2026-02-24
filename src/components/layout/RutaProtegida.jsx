import { Navigate, useLocation } from "react-router-dom"
import { useContextoAuth } from "../../contexts/ContextoAuth"

export function RutaProtegida({ children, rolRequerido }) {
  const { usuarioActual } = useContextoAuth()
  const location = useLocation()

  if (!usuarioActual) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (rolRequerido && usuarioActual.rol !== rolRequerido) {
    // Verificar jerarquía de roles
    // Normalizamos a inglés para coincidir con la base de datos
    const jerarquiaRoles = ["customer", "employee", "admin", "superadmin"]
    
    // Mapeo de roles en español a inglés por si acaso se pasan props antiguas
    const mapaRoles = {
      "cliente": "customer",
      "empleado": "employee",
      "administrador": "admin",
      "superadmin": "superadmin"
    }

    const rolUsuarioNormalizado = mapaRoles[usuarioActual.rol] || usuarioActual.rol
    const rolRequeridoNormalizado = mapaRoles[rolRequerido] || rolRequerido

    const indiceRolUsuario = jerarquiaRoles.indexOf(rolUsuarioNormalizado)
    const indiceRolRequerido = jerarquiaRoles.indexOf(rolRequeridoNormalizado)

    if (indiceRolUsuario < indiceRolRequerido) {
      return <Navigate to="/no-autorizado" replace />
    }
  }

  return <>{children}</>
}

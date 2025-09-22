"use client"

import { useContextoAuth } from "../contexts/ContextoAuth"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { Button } from "./ui/button"
import { useNavigate, useLocation } from "react-router-dom"

export function Layout({ children }) {
  const { usuarioActual, cerrarSesion } = useContextoAuth()
  const { tiendaActual } = useContextoTienda()
  const navigate = useNavigate()
  const location = useLocation()

  const manejarCerrarSesion = async () => {
    try {
      await cerrarSesion()
      navigate("/")
    } catch (error) {
      console.error("Error cerrando sesión:", error)
    }
  }

  const esPaginaPublica = ["/", "/planes", "/login", "/register"].includes(location.pathname)
  const esPaginaTienda =
    location.pathname.match(/^\/[^/]+$/) || // Dashboard principal /:slugTienda
    location.pathname.includes("/productos") ||
    location.pathname.includes("/precios") ||
    location.pathname.includes("/cotizaciones") ||
    location.pathname.includes("/ordenes") ||
    location.pathname.includes("/clientes") ||
    location.pathname.includes("/facturacion")

  return (
    <div className="min-h-screen bg-background">
      {!esPaginaPublica && !esPaginaTienda && (
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">TrackMySign</h1>
              {tiendaActual && <span className="text-sm text-muted-foreground">{tiendaActual.nombre}</span>}
            </div>

            {usuarioActual && (
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  {usuarioActual.nombre} ({usuarioActual.rol})
                </span>
                <Button variant="outline" size="sm" onClick={manejarCerrarSesion}>
                  Cerrar Sesión
                </Button>
              </div>
            )}
          </div>
        </header>
      )}

      <main>{children}</main>
    </div>
  )
}

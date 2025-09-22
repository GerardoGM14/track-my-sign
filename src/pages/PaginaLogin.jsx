"use client"

import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { ArrowLeft, Mail } from "lucide-react"
import { useContextoAuth } from "../contexts/ContextoAuth"

export function PaginaLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [cargando, setCargando] = useState(false)
  const [cargandoGoogle, setCargandoGoogle] = useState(false)
  const [error, setError] = useState("")

  const { iniciarSesion, iniciarSesionConGoogle, usuarioActual } = useContextoAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const planSeleccionado = location.state?.planSeleccionado || localStorage.getItem("planSeleccionado")
  const vieneDeRegistro = location.state?.fromPlanes || location.state?.fromRegister

  const manejarSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError("")

    try {
      await iniciarSesion(email, password)
      redirigirSegunRol()
    } catch (error) {
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setCargando(false)
    }
  }

  const manejarLoginGoogle = async () => {
    setCargandoGoogle(true)
    setError("")

    try {
      await iniciarSesionConGoogle()
      redirigirSegunRol()
    } catch (error) {
      setError(error.message || "Error al iniciar sesión con Google")
    } finally {
      setCargandoGoogle(false)
    }
  }

  const redirigirSegunRol = () => {
    if (usuarioActual?.rol === "superadmin") {
      navigate("/superadmin/dashboard")
    } else if (usuarioActual?.rol === "admin" && usuarioActual?.tiendaId) {
      navigate(`/${usuarioActual.tiendaId}/dashboard`)
    } else if (usuarioActual?.rol === "admin" && !usuarioActual?.tiendaId) {
      // Admin sin tienda configurada, ir a onboarding
      navigate("/onboarding")
    } else if (usuarioActual?.rol === "empleado" && usuarioActual?.tiendaId) {
      navigate(`/${usuarioActual.tiendaId}/dashboard`)
    } else {
      // Cliente o rol no definido
      navigate("/cliente/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header con botón volver */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(vieneDeRegistro ? "/planes" : "/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-foreground">TrackMySign</span>
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-card-foreground">Iniciar Sesión</CardTitle>
            <CardDescription className="text-muted-foreground">Accede a tu cuenta de TrackMySign</CardDescription>

            {planSeleccionado && (
              <Badge variant="secondary" className="mt-2 bg-secondary/10 text-secondary border-secondary/20">
                Plan seleccionado: {planSeleccionado.charAt(0).toUpperCase() + planSeleccionado.slice(1)}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full py-3 border-border hover:bg-muted bg-transparent"
              onClick={manejarLoginGoogle}
              disabled={cargandoGoogle}
            >
              <Mail className="h-4 w-4 mr-2" />
              {cargandoGoogle ? "Conectando..." : "Continuar con Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">O continúa con email</span>
              </div>
            </div>

            <form onSubmit={manejarSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-card-foreground">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="bg-input border-border"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-card-foreground">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-input border-border"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={cargando}
              >
                {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="text-center">
              <Link to="#" className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
                state={{ planSeleccionado, fromLogin: true }}
              >
                Regístrate gratis
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Al continuar, aceptas nuestros{" "}
          <Link to="#" className="text-primary hover:underline">
            Términos de Servicio
          </Link>{" "}
          y{" "}
          <Link to="#" className="text-primary hover:underline">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </div>
  )
}

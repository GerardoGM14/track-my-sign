"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { ArrowLeft, Info, ArrowRight } from "lucide-react"
import { useContextoAuth } from "../contexts/ContextoAuth"

export function PaginaLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [recordarme, setRecordarme] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [cargandoGoogle, setCargandoGoogle] = useState(false)
  const [error, setError] = useState("")
  const [pasoActual, setPasoActual] = useState(1) // 1 = email, 2 = password
  const [animacionKey, setAnimacionKey] = useState(0) // Para forzar re-animación
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isEntering, setIsEntering] = useState(true)

  const { iniciarSesion, iniciarSesionConGoogle, usuarioActual } = useContextoAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const planSeleccionado = location.state?.planSeleccionado || localStorage.getItem("planSeleccionado")
  const vieneDeRegistro = location.state?.fromPlanes || location.state?.fromRegister

  useEffect(() => {
    setAnimacionKey((prev) => prev + 1)
    setTimeout(() => {
      setIsEntering(false)
    }, 800)
  }, [])

  const continuarAPassword = (e) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setError("Por favor ingresa un correo válido")
      return
    }
    setError("")
    setPasoActual(2)
  }

  const volverAEmail = () => {
    setPasoActual(1)
    setPassword("")
    setError("")
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()
    if (pasoActual === 1) {
      continuarAPassword(e)
      return
    }

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
      navigate("/onboarding")
    } else if (usuarioActual?.rol === "empleado" && usuarioActual?.tiendaId) {
      navigate(`/${usuarioActual.tiendaId}/dashboard`)
    } else {
      navigate("/cliente/dashboard")
    }
  }

  const handleNavigateToRegister = (e) => {
    e.preventDefault()
    setIsTransitioning(true)

    setTimeout(() => {
      navigate("/register", {
        state: { planSeleccionado, fromLogin: true },
      })
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 relative overflow-hidden">
      {isTransitioning && (
        <div
          className="fixed inset-0 bg-white z-50"
          style={{
            animation: "fadeIn 0.8s linear forwards",
          }}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes pageEnter {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .page-content {
          animation: ${
            isTransitioning ? "fadeOut 0.8s linear forwards" : isEntering ? "pageEnter 0.8s linear forwards" : "none"
          };
        }
      `}</style>

      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: "url('/images/login-background.jpg')",
        }}
      />

      <div className={`relative z-10 min-h-screen flex items-center justify-center p-4 page-content`}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-scale">
            <div className="text-center pt-8 pb-6 animate-staggered-1">
              <div className="inline-flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center transform transition-transform hover:scale-110 duration-200">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">TRACKMYSIGN</span>
              </div>
            </div>

            <div className="px-8 pb-8">
              <div className="text-center mb-6 animate-staggered-2">
                <h1 className="text-xl font-medium text-gray-900 mb-2">Inicia sesión para continuar</h1>

                {planSeleccionado && (
                  <Badge variant="secondary" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
                    Plan seleccionado: {planSeleccionado.charAt(0).toUpperCase() + planSeleccionado.slice(1)}
                  </Badge>
                )}
              </div>

              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200 animate-slide-right">
                  {error}
                </div>
              )}

              <form onSubmit={manejarSubmit} className="space-y-4 animate-staggered-3">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Correo *
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        pasoActual === 2 ? "bg-gray-50 cursor-not-allowed" : ""
                      }`}
                      disabled={pasoActual === 2}
                      required
                    />
                    {pasoActual === 2 && (
                      <button
                        type="button"
                        onClick={volverAEmail}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-colors duration-200 animate-fade-in"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {pasoActual === 2 && (
                  <div className="animate-slide-right">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Contraseña *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                      autoFocus
                    />
                  </div>
                )}

                {pasoActual === 1 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="recordarme"
                      checked={recordarme}
                      onChange={(e) => setRecordarme(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors duration-200"
                    />
                    <Label htmlFor="recordarme" className="text-sm text-gray-700 flex items-center">
                      Recordarme
                      <Info className="w-4 h-4 ml-1 text-blue-500 hover:text-blue-600 transition-colors duration-200" />
                    </Label>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center"
                  disabled={cargando}
                >
                  {cargando ? (
                    "Iniciando sesión..."
                  ) : pasoActual === 1 ? (
                    <>
                      Continuar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </form>

              {pasoActual === 1 && (
                <div className="mt-6 animate-staggered-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">O continúa con:</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full py-2.5 px-4 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-2 bg-transparent transition-all duration-200 transform hover:scale-[1.02]"
                      onClick={manejarLoginGoogle}
                      disabled={cargandoGoogle}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>{cargandoGoogle ? "Conectando..." : "Google"}</span>
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center text-sm animate-staggered-4">
                <Link to="#" className="text-blue-600 hover:underline transition-colors duration-200">
                  ¿No puedes iniciar sesión?
                </Link>
                <span className="mx-2 text-gray-400">•</span>
                <a
                  href="/register"
                  onClick={handleNavigateToRegister}
                  className="text-blue-600 hover:underline transition-colors duration-200"
                >
                  Crear una cuenta
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center animate-staggered-4">
            <div className="inline-flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-gray-600 font-medium">TRACKMYSIGN</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Una cuenta para gestión de señalética y más</p>
            <div className="flex justify-center space-x-4 text-xs">
              <Link to="#" className="text-blue-600 hover:underline transition-colors duration-200">
                Política de privacidad
              </Link>
              <Link to="#" className="text-blue-600 hover:underline transition-colors duration-200">
                Aviso de usuario
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Este sitio está protegido por reCAPTCHA y se aplican la política de privacidad y las condiciones de
              servicio de Google.
            </p>
          </div>
        </div>
      </div>

      {vieneDeRegistro && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/planes")}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 z-20 transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useContextoAuth } from "../contexts/ContextoAuth"

export function PaginaRegistro() {
  const [datosFormulario, setDatosFormulario] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmarPassword: "",
  })
  const [cargando, setCargando] = useState(false)
  const [cargandoGoogle, setCargandoGoogle] = useState(false)
  const [error, setError] = useState("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isEntering, setIsEntering] = useState(true)

  const { registrar, iniciarSesionConGoogle, usuarioActual } = useContextoAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => {
      setIsEntering(false)
    }, 800)
  }, [])

  const manejarSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError("")

    if (datosFormulario.password !== datosFormulario.confirmarPassword) {
      setError("Las contraseñas no coinciden")
      setCargando(false)
      return
    }

    try {
      await registrar(datosFormulario.email, datosFormulario.password, {
        nombre: datosFormulario.nombre,
      })
      navigate("/precios")
    } catch (error) {
      setError(error.message || "Error al crear la cuenta")
    } finally {
      setCargando(false)
    }
  }

  const manejarCambio = (campo, valor) => {
    setDatosFormulario((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const handleNavigateToLogin = (e) => {
    e.preventDefault()
    setIsTransitioning(true)

    setTimeout(() => {
      navigate("/login")
    }, 800)
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
    // Para usuarios nuevos registrados, siempre ir a precios
    navigate("/precios")
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('/images/login-background.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
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

      <div className={`w-full max-w-md page-content`}>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">TRACKMYSIGN</span>
            </div>
            <h1 className="text-xl font-medium text-gray-800 mb-6">Crear tu cuenta</h1>
          </div>

          <div>
            <form onSubmit={manejarSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</div>
              )}

              <div>
                <Label htmlFor="nombre" className="text-sm font-medium text-gray-700 mb-1 block">
                  Nombre completo *
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  value={datosFormulario.nombre}
                  onChange={(e) => manejarCambio("nombre", e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                  Correo *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={datosFormulario.email}
                  onChange={(e) => manejarCambio("email", e.target.value)}
                  placeholder="nombre@empresa.com"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
                  Contraseña *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={datosFormulario.password}
                  onChange={(e) => manejarCambio("password", e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmarPassword" className="text-sm font-medium text-gray-700 mb-1 block">
                  Confirmar contraseña *
                </Label>
                <Input
                  id="confirmarPassword"
                  type="password"
                  value={datosFormulario.confirmarPassword}
                  onChange={(e) => manejarCambio("confirmarPassword", e.target.value)}
                  placeholder="Confirma tu contraseña"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  required
                />
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="recordarme"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="recordarme" className="ml-2 text-sm text-gray-700 flex items-center">
                  Recordarme
                  <div className="ml-1 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">i</span>
                  </div>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 mt-6 flex items-center justify-center"
                disabled={cargando}
              >
                {cargando ? "Creando cuenta..." : "Continuar"}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </form>
          </div>

          <div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con:</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
              onClick={manejarLoginGoogle}
              disabled={cargandoGoogle}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
              {cargandoGoogle ? "Conectando..." : "Google"}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 mt-6">
            <p>
              <a
                href="/login"
                onClick={handleNavigateToLogin}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                ¿Ya tienes cuenta?
              </a>
              {" • "}
              <a
                href="/login"
                onClick={handleNavigateToLogin}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Iniciar sesión
              </a>
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <div className="flex items-center justify-center mb-2">
            <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-sm text-gray-500 font-medium">TRACKMYSIGN</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">Una cuenta para gestión de señalética y más</p>
          <div className="flex justify-center space-x-4 text-xs text-blue-600">
            <a href="#" className="hover:text-blue-700 transition-colors duration-200">
              Política de privacidad
            </a>
            <a href="#" className="hover:text-blue-700 transition-colors duration-200">
              Aviso de usuario
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Este sitio está protegido por reCAPTCHA y se aplican la política de privacidad y las condiciones de servicio
            de Google.
          </p>
        </div>
      </div>
    </div>
  )
}

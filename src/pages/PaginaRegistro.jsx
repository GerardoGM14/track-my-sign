"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useContextoAuth } from "../contexts/ContextoAuth"

export function PaginaRegistro() {
  const [datosFormulario, setDatosFormulario] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmarPassword: "",
    rol: "cliente",
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")

  const { registrar } = useContextoAuth()
  const navigate = useNavigate()

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
        rol: datosFormulario.rol,
      })
      navigate("/")
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

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear Cuenta</CardTitle>
          <CardDescription>Únete a TrackMySign hoy</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarSubmit} className="space-y-4">
            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

            <div>
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                type="text"
                value={datosFormulario.nombre}
                onChange={(e) => manejarCambio("nombre", e.target.value)}
                placeholder="Ingresa tu nombre completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={datosFormulario.email}
                onChange={(e) => manejarCambio("email", e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                required
              />
            </div>

            <div>
              <Label htmlFor="rol">Rol</Label>
              <Select value={datosFormulario.rol} onValueChange={(valor) => manejarCambio("rol", valor)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="empleado">Empleado</SelectItem>
                  <SelectItem value="admin">Administrador de Tienda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={datosFormulario.password}
                onChange={(e) => manejarCambio("password", e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmarPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmarPassword"
                type="password"
                value={datosFormulario.confirmarPassword}
                onChange={(e) => manejarCambio("confirmarPassword", e.target.value)}
                placeholder="Confirma tu contraseña"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Iniciar sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

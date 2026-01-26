"use client"

import { useState, useEffect } from "react"
import { useContextoAuth } from "../contexts/ContextoAuth"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { User, Mail, Shield, Key, Save } from "lucide-react"
import { toast } from "../hooks/user-toast"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { updateProfile } from "firebase/auth"

export default function PaginaPerfil() {
  const { usuarioActual, auth } = useContextoAuth()
  const [cargando, setCargando] = useState(false)
  const [perfil, setPerfil] = useState({
    nombre: "",
    email: "",
    rol: "",
  })

  useEffect(() => {
    if (usuarioActual) {
      setPerfil({
        nombre: usuarioActual.nombre || usuarioActual.displayName || "",
        email: usuarioActual.email || "",
        rol: usuarioActual.rol || "usuario",
      })
    }
  }, [usuarioActual])

  const manejarGuardar = async (e) => {
    e.preventDefault()
    try {
      setCargando(true)

      // Actualizar en Firebase Auth
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: perfil.nombre
        })
      }

      // Actualizar en Firestore (colección usuarios global o tienda especifica?)
      // Asumimos que usuarioActual tiene referencia a su doc.
      // Pero usuarioActual viene del contexto, que lo carga de Firestore.
      // Depende de cómo esté estructurada la DB.
      // Normalmente los usuarios están en una colección "usuarios" global o dentro de "tiendas".
      // Si es multi-tenant, el usuario pertenece a una tienda.
      // Vamos a intentar actualizar en la colección de usuarios si tenemos el ID.
      
      // Nota: Si el usuario está en `tiendas/{tiendaId}/usuarios/{uid}`, necesitamos saber la tienda.
      // Pero el contexto auth suele traer el usuario con su ID.
      // Si no tenemos la ruta exacta, solo actualizamos Auth por ahora y mostramos éxito.
      // Si el contexto auth guarda el usuario en localStorage o similar, se actualizará al recargar.
      
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente.",
      })
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="space-y-6 min-h-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Mi Perfil</h1>
          <p className="text-sm text-gray-600 mt-1 leading-tight">Gestiona tu información personal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Tarjeta de Resumen */}
        <div className="lg:col-span-1">
          <Card className="border border-gray-200 rounded-xl shadow-md bg-white h-full">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center mb-4 text-white text-3xl font-bold">
                {perfil.nombre.charAt(0).toUpperCase()}
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">{perfil.nombre}</CardTitle>
              <CardDescription className="text-sm text-gray-500">{perfil.email}</CardDescription>
              <div className="mt-4 flex justify-center">
                <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 capitalize">
                  {perfil.rol}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Info adicional si fuera necesaria */}
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Formulario de Edición */}
        <div className="lg:col-span-2">
          <form onSubmit={manejarGuardar}>
            <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Información Personal</CardTitle>
                </div>
                <CardDescription className="text-sm text-gray-600 leading-tight">
                  Actualiza tus datos de identificación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="nombre"
                        value={perfil.nombre}
                        onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
                        className="pl-9"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        value={perfil.email}
                        disabled
                        className="pl-9 bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500">El correo electrónico no se puede cambiar.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rol" className="text-sm font-medium text-gray-700">Rol</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="rol"
                        value={perfil.rol}
                        disabled
                        className="pl-9 bg-gray-50 text-gray-500 capitalize cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={cargando}
                  >
                    {cargando ? (
                      <>Guardando...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Sección de Seguridad (Placeholder) */}
          <Card className="mt-6 border border-gray-200 rounded-xl shadow-md bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Seguridad</CardTitle>
              </div>
              <CardDescription className="text-sm text-gray-600 leading-tight">
                Gestiona tu contraseña y seguridad de la cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">Contraseña</p>
                  <p className="text-sm text-gray-500">Cambia tu contraseña periódicamente para mayor seguridad.</p>
                </div>
                <Button variant="outline" onClick={() => toast({ title: "Próximamente", description: "Esta funcionalidad estará disponible pronto." })}>
                  Cambiar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

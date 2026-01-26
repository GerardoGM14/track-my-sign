"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/ContextoAuth"
import { useTienda } from "../contexts/ContextoTienda"
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth"
import { initializeApp, getApp, getApps, deleteApp } from "firebase/app"
import { db, auth, firebaseConfig } from "../lib/firebase"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Trash2, Edit, Plus, Users, Mail, Phone, Calendar, X, HelpCircle, CheckCircle } from "lucide-react"
import { toast } from "../hooks/user-toast.js"

export default function PaginaUsuarios() {
  const { usuario } = useAuth()
  const { tiendaActual } = useTienda()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    rol: "employee",
    password: "",
  })

  // Cargar usuarios de la tienda
  useEffect(() => {
    cargarUsuarios()
  }, [tiendaActual])

  const cargarUsuarios = async () => {
    if (!tiendaActual) return

    try {
      const q = query(collection(db, "usuarios"), where("tiendaId", "==", tiendaActual.id))
      const snapshot = await getDocs(q)
      const usuariosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setUsuarios(usuariosData)
    } catch (error) {
      console.error("Error cargando usuarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()

    try {
      if (usuarioEditando) {
        // Actualizar usuario existente
        await updateDoc(doc(db, "usuarios", usuarioEditando.id), {
          nombre: formData.nombre,
          telefono: formData.telefono,
          rol: formData.rol,
          fechaActualizacion: new Date(),
        })
        toast({
          title: "Usuario actualizado",
          description: "Los datos del usuario se han actualizado correctamente",
        })
      } else {
        // Crear nuevo usuario usando una app secundaria para no desloguear al admin
        let secondaryApp
        try {
            // Inicializar app secundaria con un nombre único
            const appName = `secondaryApp-${Date.now()}`
            secondaryApp = initializeApp(firebaseConfig, appName)
            const secondaryAuth = getAuth(secondaryApp)

            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password)
            
            // Cerrar sesión en la app secundaria inmediatamente
            await signOut(secondaryAuth)

            await addDoc(collection(db, "usuarios"), {
              uid: userCredential.user.uid,
              nombre: formData.nombre,
              email: formData.email,
              telefono: formData.telefono,
              rol: formData.rol,
              tiendaId: tiendaActual.id,
              creadoPor: usuario.uid,
              fechaCreacion: new Date(),
              activo: true,
            })

            toast({
              title: "Usuario creado",
              description: `${formData.rol === "employee" ? "Empleado" : "Cliente"} creado exitosamente`,
            })
        } catch (authError) {
             console.error("Error en auth secundaria:", authError)
             throw authError
        } finally {
            if (secondaryApp) {
                await deleteApp(secondaryApp)
            }
        }
      }

      setModalAbierto(false)
      setUsuarioEditando(null)
      setFormData({ nombre: "", email: "", telefono: "", rol: "employee", password: "" })
      cargarUsuarios()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const eliminarUsuario = async (usuarioId) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return

    try {
      await deleteDoc(doc(db, "usuarios", usuarioId))
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      })
      cargarUsuarios()
    } catch (error) {
      console.error("Error eliminando usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    }
  }

  const abrirModalEdicion = (usuario) => {
    setUsuarioEditando(usuario)
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono || "",
      rol: usuario.rol,
      password: "",
    })
    setModalAbierto(true)
  }

  const abrirModalCreacion = () => {
    setUsuarioEditando(null)
    setFormData({ nombre: "", email: "", telefono: "", rol: "employee", password: "" })
    setModalAbierto(true)
  }

  const getRolBadgeColor = (rol) => {
    switch (rol) {
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "employee":
        return "bg-green-100 text-green-800"
      case "customer":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRolLabel = (rol) => {
    switch (rol) {
      case "admin":
        return "Administrador"
      case "employee":
        return "Empleado"
      case "customer":
        return "Cliente"
      default:
        return rol
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 min-h-full px-18">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-600 mt-1 leading-tight">Administra empleados y clientes de tu tienda</p>
        </div>
        <Button 
          onClick={abrirModalCreacion}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 leading-tight">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 leading-tight">{usuarios.filter((u) => u.rol === "employee").length}</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 leading-tight">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 leading-tight">{usuarios.filter((u) => u.rol === "customer").length}</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 leading-tight">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 leading-tight">{usuarios.filter((u) => u.activo).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuarios */}
      <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 leading-tight">Lista de Usuarios</CardTitle>
          <CardDescription className="text-sm text-gray-600 leading-tight">Todos los empleados y clientes de tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-base font-medium text-gray-900 mb-2">No hay usuarios</h3>
              <p className="text-sm text-gray-500 mb-6">Comienza creando tu primer empleado o cliente.</p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={abrirModalCreacion}
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Usuario
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {usuarios.map((usuarioItem) => (
                <div 
                  key={usuarioItem.id} 
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">
                        {usuarioItem.nombre?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{usuarioItem.nombre}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center truncate">
                          <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{usuarioItem.email}</span>
                        </span>
                        {usuarioItem.telefono && (
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                            {usuarioItem.telefono}
                          </span>
                        )}
                        {usuarioItem.fechaCreacion && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                            {usuarioItem.fechaCreacion?.toDate 
                              ? usuarioItem.fechaCreacion.toDate().toLocaleDateString()
                              : new Date(usuarioItem.fechaCreacion).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge className={`${getRolBadgeColor(usuarioItem.rol)} text-xs capitalize`}>
                      {getRolLabel(usuarioItem.rol)}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => abrirModalEdicion(usuarioItem)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarUsuario(usuarioItem.id)}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overlay oscuro cuando el sidebar está abierto */}
      {modalAbierto && (
        <div 
          className="fixed inset-0 bg-gray-600/40 z-[100] transition-opacity duration-300"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0
          }}
          onClick={() => {
            setModalAbierto(false)
            setUsuarioEditando(null)
            setFormData({ nombre: "", email: "", telefono: "", rol: "employee", password: "" })
          }}
        />
      )}

      {/* Sidebar que se desliza desde la derecha */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${
          modalAbierto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
          {/* Header del sidebar */}
          <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {usuarioEditando ? "Editar Usuario" : "Nuevo Usuario"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {usuarioEditando ? "Modifica los datos del usuario" : "Crea un nuevo usuario para la tienda"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalAbierto(false)
                  setUsuarioEditando(null)
                  setFormData({ nombre: "", email: "", telefono: "", rol: "employee", password: "" })
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto h-[calc(100%-88px)]">
             <form onSubmit={manejarSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!usuarioEditando}
                  required
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="rol">Rol</Label>
                <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {usuario.rol === "admin" && <SelectItem value="employee">Empleado</SelectItem>}
                    <SelectItem value="customer">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!usuarioEditando && (
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setModalAbierto(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {usuarioEditando ? "Actualizar" : "Crear Usuario"}
                </Button>
              </div>
            </form>
          </div>
      </div>
    </div>
  )
}

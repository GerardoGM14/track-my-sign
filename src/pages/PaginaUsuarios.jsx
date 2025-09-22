"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/ContextoAuth"
import { useTienda } from "../contexts/ContextoTienda"
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { db, auth } from "../lib/firebase"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Trash2, Edit, Plus, Users, Mail, Phone, Calendar } from "lucide-react"
import { toast } from "../../hooks/use-toast"

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
        // Crear nuevo usuario
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra empleados y clientes de tu tienda</p>
        </div>
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogTrigger asChild>
            <Button onClick={abrirModalCreacion} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{usuarioEditando ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
              <DialogDescription>
                {usuarioEditando
                  ? "Modifica los datos del usuario seleccionado"
                  : "Completa los datos para crear un nuevo usuario"}
              </DialogDescription>
            </DialogHeader>
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
                  disabled={usuarioEditando}
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
                <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {usuarioEditando ? "Actualizar" : "Crear Usuario"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuarios.filter((u) => u.rol === "employee").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuarios.filter((u) => u.rol === "customer").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuarios.filter((u) => u.activo).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Todos los empleados y clientes de tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer empleado o cliente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">{usuario.nombre.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{usuario.nombre}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {usuario.email}
                        </span>
                        {usuario.telefono && (
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {usuario.telefono}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {usuario.fechaCreacion?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRolBadgeColor(usuario.rol)}>{getRolLabel(usuario.rol)}</Badge>
                    <Button variant="outline" size="sm" onClick={() => abrirModalEdicion(usuario)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarUsuario(usuario.id)}
                      className="text-red-600 hover:text-red-700"
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
    </div>
  )
}

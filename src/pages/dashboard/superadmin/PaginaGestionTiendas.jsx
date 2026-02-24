import { useState, useEffect } from "react"
import { Search, MoreVertical, Store, Plus, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, where, setDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth"
import { initializeApp, deleteApp } from "firebase/app"
import { db, firebaseConfig } from "@/lib/firebase"
import { toast } from "@/hooks/user-toast"

export default function PaginaGestionTiendas() {
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [tiendas, setTiendas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [creandoTienda, setCreandoTienda] = useState(false)

  // Estado para nueva tienda
  const [nuevaTienda, setNuevaTienda] = useState({
    nombre: "",
    slug: "",
    plan: "professional",
    nombrePropietario: "",
    emailPropietario: "",
    passwordPropietario: ""
  })

  // Cargar tiendas al montar
  useEffect(() => {
    cargarTiendas()
  }, [])

  const cargarTiendas = async () => {
    try {
      setCargando(true)
      const tiendasRef = collection(db, "tiendas")
      const snapshot = await getDocs(tiendasRef)
      
      const tiendasData = await Promise.all(snapshot.docs.map(async (docTienda) => {
        const data = docTienda.data()
        // Intentar obtener el propietario si existe el ID
        let propietarioEmail = "Sin asignar"
        let propietarioNombre = "Sin asignar"
        
        // Si quisiéramos ser más estrictos, haríamos un fetch del usuario propietario aquí
        // Por ahora usamos los datos denormalizados si existen en la tienda
        
        return {
          id: docTienda.id,
          ...data,
          // Fallbacks visuales
          propietario: data.propietarioNombre || propietarioNombre,
          email: data.propietarioEmail || propietarioEmail,
          fechaRegistro: data.fechaCreacion ? new Date(data.fechaCreacion.seconds * 1000).toLocaleDateString() : "N/A"
        }
      }))
      
      setTiendas(tiendasData)
    } catch (error) {
      console.error("Error cargando tiendas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las tiendas",
        variant: "destructive"
      })
    } finally {
      setCargando(false)
    }
  }

  const generarSlug = (nombre) => {
    return nombre
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Eliminar guiones duplicados
      .trim()
  }

  const handleNombreChange = (e) => {
    const nombre = e.target.value
    setNuevaTienda(prev => ({
      ...prev,
      nombre,
      slug: generarSlug(nombre)
    }))
  }

  const crearTienda = async (e) => {
    e.preventDefault()
    
    // Validaciones básicas
    if (!nuevaTienda.nombre || !nuevaTienda.emailPropietario || !nuevaTienda.passwordPropietario) {
      toast({ title: "Faltan datos", description: "Completa todos los campos obligatorios", variant: "destructive" })
      return
    }

    if (nuevaTienda.passwordPropietario.length < 6) {
      toast({ title: "Contraseña débil", description: "Mínimo 6 caracteres", variant: "destructive" })
      return
    }

    try {
      setCreandoTienda(true)
      
      // 1. Crear usuario en Auth (App secundaria)
      let secondaryApp
      let uidPropietario
      
      try {
        const appName = `secondaryApp-store-${Date.now()}`
        secondaryApp = initializeApp(firebaseConfig, appName)
        const secondaryAuth = getAuth(secondaryApp)
        
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth, 
          nuevaTienda.emailPropietario, 
          nuevaTienda.passwordPropietario
        )
        uidPropietario = userCredential.user.uid
        await signOut(secondaryAuth)
      } catch (authError) {
        console.error("Error Auth:", authError)
        throw new Error(`Error creando usuario: ${authError.message}`)
      } finally {
        if (secondaryApp) await deleteApp(secondaryApp)
      }

      // 2. Crear documento de Tienda
      const tiendaData = {
        nombre: nuevaTienda.nombre,
        slug: nuevaTienda.slug,
        plan: nuevaTienda.plan,
        estado: "activa",
        propietarioId: uidPropietario,
        propietarioNombre: nuevaTienda.nombrePropietario,
        propietarioEmail: nuevaTienda.emailPropietario,
        fechaCreacion: serverTimestamp(),
        configuracion: {
          moneda: "EUR",
          pais: "ES"
        }
      }
      
      const tiendaRef = await addDoc(collection(db, "tiendas"), tiendaData)
      const tiendaId = tiendaRef.id

      // 3. Crear documento de Usuario (vinculado a la tienda)
      await setDoc(doc(db, "usuarios", uidPropietario), {
        uid: uidPropietario,
        nombre: nuevaTienda.nombrePropietario,
        email: nuevaTienda.emailPropietario,
        rol: "admin", // Dueño de tienda
        tiendaId: tiendaId,
        fechaCreacion: serverTimestamp(),
        activo: true
      })

      // 4. Finalizar
      toast({
        title: "Tienda creada",
        description: `La tienda "${nuevaTienda.nombre}" se ha creado correctamente.`
      })
      
      setModalAbierto(false)
      setNuevaTienda({
        nombre: "",
        slug: "",
        plan: "professional",
        nombrePropietario: "",
        emailPropietario: "",
        passwordPropietario: ""
      })
      cargarTiendas()

    } catch (error) {
      console.error("Error creando tienda:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la tienda",
        variant: "destructive"
      })
    } finally {
      setCreandoTienda(false)
    }
  }

  const cambiarEstadoTienda = async (tiendaId, nuevoEstado) => {
    try {
      await updateDoc(doc(db, "tiendas", tiendaId), {
        estado: nuevoEstado
      })
      
      setTiendas(prev => prev.map(t => 
        t.id === tiendaId ? { ...t, estado: nuevoEstado } : t
      ))
      
      toast({ title: "Estado actualizado" })
    } catch (error) {
      console.error("Error actualizando estado:", error)
      toast({ title: "Error", variant: "destructive" })
    }
  }

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "activa":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Activa</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">Pendiente</Badge>
      case "suspendida":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Suspendida</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const tiendasFiltradas = tiendas.filter(tienda => {
    const coincideBusqueda = tienda.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
                             tienda.email?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === "todos" || tienda.estado === filtroEstado
    return coincideBusqueda && coincideEstado
  })

  return (
    <div className="flex flex-col max-h-[calc(100vh-220px)] px-18 pt-4 pb-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Gestión de Tiendas</h1>
        
        <div className="flex items-center gap-3">
          {/* Barra de búsqueda */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar tienda..."
              className="pl-10 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Filtro de Estado */}
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[180px] bg-white border-gray-300 rounded-lg">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="activa">Activa</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="suspendida">Suspendida</SelectItem>
            </SelectContent>
          </Select>

          {/* Botón Nueva Tienda */}
          <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Nueva Tienda
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Tienda</DialogTitle>
                <DialogDescription>
                  Crea una nueva tienda y asigna un propietario administrador.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={crearTienda} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Tienda</Label>
                    <Input 
                      id="nombre" 
                      placeholder="Ej: Imprenta Pepe" 
                      value={nuevaTienda.nombre}
                      onChange={handleNombreChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input 
                      id="slug" 
                      value={nuevaTienda.slug}
                      onChange={(e) => setNuevaTienda({...nuevaTienda, slug: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">Plan Inicial</Label>
                  <Select 
                    value={nuevaTienda.plan} 
                    onValueChange={(val) => setNuevaTienda({...nuevaTienda, plan: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="professional">Profesional</SelectItem>
                      <SelectItem value="enterprise">Empresarial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombreProp">Nombre Propietario</Label>
                  <Input 
                    id="nombreProp" 
                    placeholder="Ej: Pepe Pérez" 
                    value={nuevaTienda.nombrePropietario}
                    onChange={(e) => setNuevaTienda({...nuevaTienda, nombrePropietario: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Admin</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="admin@tienda.com" 
                      value={nuevaTienda.emailPropietario}
                      onChange={(e) => setNuevaTienda({...nuevaTienda, emailPropietario: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={nuevaTienda.passwordPropietario}
                      onChange={(e) => setNuevaTienda({...nuevaTienda, passwordPropietario: e.target.value})}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-blue-600 text-white" disabled={creandoTienda}>
                    {creandoTienda ? "Creando..." : "Crear Tienda"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Card con la tabla */}
      <Card className="border border-gray-200 rounded-xl shadow-md bg-white overflow-hidden flex-1 flex flex-col min-h-0">
        <CardContent className="p-0 flex-1 overflow-auto">
          {cargando ? (
            <div className="flex justify-center items-center h-40">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Tienda</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Propietario</th>
                <th className="px-6 py-3 font-medium">Plan</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">Registro</th>
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tiendasFiltradas.map((tienda) => (
                <tr key={tienda.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{tienda.nombre}</div>
                    <div className="text-xs text-gray-500">{tienda.slug}</div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="font-medium text-gray-900">{tienda.propietario}</div>
                    <div className="text-xs text-gray-500">{tienda.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-700 capitalize">
                      {tienda.plan}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{getEstadoBadge(tienda.estado)}</td>
                  <td className="px-6 py-4 hidden sm:table-cell text-gray-500">{tienda.fechaRegistro}</td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                          <span className="sr-only">Abrir menú</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(tienda.id)}>
                          Copiar ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {tienda.estado === "activa" ? (
                          <DropdownMenuItem className="text-red-600" onClick={() => cambiarEstadoTienda(tienda.id, "suspendida")}>
                            <XCircle className="mr-2 h-4 w-4" /> Suspender
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600" onClick={() => cambiarEstadoTienda(tienda.id, "activa")}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Activar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {tiendasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron tiendas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

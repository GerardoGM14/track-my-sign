import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Save, Shield, UserCog, Database, Bell } from "lucide-react"

export default function PaginaAdministracion() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administración del Sistema</h1>
          <p className="text-muted-foreground">Configuración global y gestión de usuarios administradores.</p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" /> Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="admins">Administradores</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Ajustes básicos de la plataforma SaaS.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="platform-name">Nombre de la Plataforma</Label>
                <Input id="platform-name" defaultValue="TrackMySign" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="support-email">Email de Soporte</Label>
                <Input id="support-email" defaultValue="soporte@trackmysign.com" />
              </div>
              <div className="flex items-center justify-between space-x-2 border p-4 rounded-md">
                <div className="space-y-0.5">
                  <Label className="text-base">Modo Mantenimiento</Label>
                  <p className="text-sm text-muted-foreground">
                    Desactivar el acceso a todas las tiendas temporalmente.
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Super Administradores</CardTitle>
              <CardDescription>Usuarios con acceso total al panel de control.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button size="sm">
                    <UserCog className="mr-2 h-4 w-4" /> Añadir Admin
                  </Button>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                        SA
                      </div>
                      <div>
                        <p className="font-medium">Super Admin</p>
                        <p className="text-sm text-muted-foreground">superadmin@trackmysign.com</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Principal
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        JD
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-muted-foreground">john.doe@trackmysign.com</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

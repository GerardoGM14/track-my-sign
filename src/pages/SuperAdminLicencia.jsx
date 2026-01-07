"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { toast } from "../hooks/user-toast"
import { Save, Building2 } from "lucide-react"

export default function SuperAdminLicencia() {
  const [tiendaId, setTiendaId] = useState("")
  const [licencia, setLicencia] = useState({
    tipo: "Avanzado",
    periodo: "Anual",
    fechaInicio: "",
    fechaFin: "",
  })
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const manejarCambio = (campo, valor) => {
    setLicencia({ ...licencia, [campo]: valor })
  }

  const cargarLicencia = async () => {
    if (!tiendaId) {
      toast({
        title: "Error",
        description: "Por favor ingresa un ID de tienda",
        variant: "destructive",
      })
      return
    }

    try {
      setCargando(true)
      const licenciaRef = doc(db, "tiendas", tiendaId, "configuracion", "licencia")
      const licenciaSnap = await getDoc(licenciaRef)

      if (licenciaSnap.exists()) {
        const datos = licenciaSnap.data()
        const fechaInicio = datos.fechaInicio?.toDate 
          ? datos.fechaInicio.toDate().toISOString().split('T')[0]
          : datos.fechaInicio || ""
        const fechaFin = datos.fechaFin?.toDate 
          ? datos.fechaFin.toDate().toISOString().split('T')[0]
          : datos.fechaFin || ""

        setLicencia({
          tipo: datos.tipo || "Avanzado",
          periodo: datos.periodo || "Anual",
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
        })

        toast({
          title: "Licencia cargada",
          description: "La información de la licencia se ha cargado correctamente",
        })
      } else {
        toast({
          title: "No encontrado",
          description: "No se encontró información de licencia para esta tienda",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cargando licencia:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la licencia",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const guardarLicencia = async () => {
    if (!tiendaId) {
      toast({
        title: "Error",
        description: "Por favor ingresa un ID de tienda",
        variant: "destructive",
      })
      return
    }

    if (!licencia.fechaInicio || !licencia.fechaFin) {
      toast({
        title: "Error",
        description: "Por favor completa todas las fechas",
        variant: "destructive",
      })
      return
    }

    try {
      setGuardando(true)
      const licenciaRef = doc(db, "tiendas", tiendaId, "configuracion", "licencia")
      
      await setDoc(licenciaRef, {
        tipo: licencia.tipo,
        periodo: licencia.periodo,
        fechaInicio: new Date(licencia.fechaInicio),
        fechaFin: new Date(licencia.fechaFin),
        fechaActualizacion: new Date(),
      }, { merge: true })

      toast({
        title: "Licencia guardada",
        description: "La información de la licencia se ha guardado correctamente",
      })
    } catch (error) {
      console.error("Error guardando licencia:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la información de la licencia",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6 min-h-full px-18">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Configuración de Licencias</h1>
          <p className="text-sm text-gray-600 mt-1 leading-tight">Gestiona las licencias de las tiendas</p>
        </div>
      </div>

      <Card className="border border-gray-200 rounded-xl shadow-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Información de Licencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ID de Tienda */}
          <div className="space-y-2">
            <Label htmlFor="tiendaId">ID de Tienda</Label>
            <div className="flex gap-2">
              <Input
                id="tiendaId"
                value={tiendaId}
                onChange={(e) => setTiendaId(e.target.value)}
                placeholder="Ingresa el ID de la tienda"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={cargarLicencia}
                disabled={cargando || !tiendaId}
                variant="outline"
              >
                {cargando ? "Cargando..." : "Cargar"}
              </Button>
            </div>
          </div>

          {/* Tipo de Licencia */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Licencia</Label>
            <Select value={licencia.tipo} onValueChange={(value) => manejarCambio("tipo", value)}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecciona el tipo de licencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Básico">Básico</SelectItem>
                <SelectItem value="Profesional">Profesional</SelectItem>
                <SelectItem value="Avanzado">Avanzado</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label htmlFor="periodo">Período</Label>
            <Select value={licencia.periodo} onValueChange={(value) => manejarCambio("periodo", value)}>
              <SelectTrigger id="periodo">
                <SelectValue placeholder="Selecciona el período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mensual">Mensual</SelectItem>
                <SelectItem value="Trimestral">Trimestral</SelectItem>
                <SelectItem value="Semestral">Semestral</SelectItem>
                <SelectItem value="Anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={licencia.fechaInicio}
                onChange={(e) => manejarCambio("fechaInicio", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de Fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={licencia.fechaFin}
                onChange={(e) => manejarCambio("fechaFin", e.target.value)}
              />
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={guardarLicencia}
              disabled={guardando || !tiendaId}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {guardando ? "Guardando..." : "Guardar Licencia"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


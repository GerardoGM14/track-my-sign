"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { Button } from "./ui/button"
import { HelpCircle } from "lucide-react"
import houseSvg from "../assets/subs/house.svg"

export default function TarjetaLicencia() {
  const { tiendaActual } = useContextoTienda()
  const [licencia, setLicencia] = useState({
    tipo: "Avanzado",
    periodo: "Anual",
    fechaInicio: "06/01/2025",
    fechaFin: "06/01/2026",
    diasRestantes: 320,
  })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (tiendaActual) {
      cargarLicencia()
    }
  }, [tiendaActual])

  const cargarLicencia = async () => {
    try {
      setCargando(true)
      if (tiendaActual) {
        const licenciaRef = doc(db, "tiendas", tiendaActual.id, "configuracion", "licencia")
        const licenciaSnap = await getDoc(licenciaRef)

        if (licenciaSnap.exists()) {
          const datos = licenciaSnap.data()
          // Calcular días restantes
          const fechaFin = datos.fechaFin?.toDate ? datos.fechaFin.toDate() : new Date(datos.fechaFin)
          const hoy = new Date()
          const diasRestantes = Math.max(0, Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24)))

          setLicencia({
            tipo: datos.tipo || "Avanzado",
            periodo: datos.periodo || "Anual",
            fechaInicio: datos.fechaInicio || "06/01/2025",
            fechaFin: datos.fechaFin?.toDate ? datos.fechaFin.toDate().toLocaleDateString('es-ES') : datos.fechaFin || "06/01/2026",
            diasRestantes: diasRestantes || 320,
          })
        }
      }
    } catch (error) {
      console.error("Error cargando licencia:", error)
    } finally {
      setCargando(false)
    }
  }

  const calcularPorcentaje = () => {
    // Asumimos un año completo (365 días) para calcular el porcentaje
    const diasTotales = licencia.periodo === "Anual" ? 365 : 30
    return Math.max(0, Math.min(100, ((diasTotales - licencia.diasRestantes) / diasTotales) * 100))
  }

  if (cargando) {
    return (
      <div 
        className="h-[180px] md:h-[200px] lg:h-[220px] w-auto rounded-xl flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundColor: '#333332'
        }}
      >
        <div className="relative z-10 animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div 
      className="h-[180px] md:h-[200px] lg:h-[220px] w-auto rounded-xl p-5 md:p-6 flex flex-col justify-between relative overflow-hidden"
      style={{
        backgroundColor: '#333332'
      }}
    >

      {/* Imagen de la casa */}
      <img 
        src={houseSvg} 
        alt="Casa decorativa" 
        className="absolute h-auto w-auto opacity-80"
        style={{ 
          top: '45%',
          left: '70%',
          maxHeight: '150%',
          maxWidth: '110%',
          zIndex: 1
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header - Arriba de todo */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-xl font-bold">
            Su Licencia Actual: <span className="text-yellow-400">{licencia.tipo}</span>
          </h3>
          <div className="bg-gray-700 text-white text-sm px-3 py-1 rounded-full">
            {licencia.periodo}
          </div>
        </div>

        {/* Fechas */}
        <div className="text-gray-400 text-sm mb-3">
          <span>Inicio: {licencia.fechaInicio}</span>{" "}
          <span className="ml-2">Fin: {licencia.fechaFin}</span>
        </div>

        {/* Días restantes - Debajo de Inicio y Fin */}
        <div className="mb-1.5">
          <div className="flex items-center mb-1.5" style={{ width: '65%' }}>
            <span className="text-white text-base font-semibold">Días Restantes</span>
            <span className="text-white text-base font-semibold ml-auto">{licencia.diasRestantes} días</span>
          </div>
          {/* Barra de progreso - Acortada desde la derecha */}
          <div className="bg-gray-700 rounded-full h-2" style={{ width: '65%' }}>
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calcularPorcentaje()}%` }}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2 mt-4" style={{ width: '65%' }}>
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-gray-800 hover:bg-gray-100 text-xs h-7 px-3 flex-1"
          >
            Cambiar Plan
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600 text-xs h-7 px-3 flex-1"
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Soporte
          </Button>
        </div>
      </div>
    </div>
  )
}


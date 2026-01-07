"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useContextoTienda } from "../contexts/ContextoTienda"
import { Button } from "./ui/button"
import { HelpCircle } from "lucide-react"

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
      <div className="h-[180px] md:h-[200px] lg:h-[220px] w-auto bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="h-[180px] md:h-[200px] lg:h-[220px] w-auto bg-gray-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
      {/* Ilustración del edificio en la esquina inferior derecha */}
      <div className="absolute bottom-2 right-2 w-20 h-20 opacity-80">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Edificio principal */}
          <rect x="20" y="30" width="50" height="50" fill="#FDEEB2" rx="2" />
          {/* Ventanas superiores */}
          <rect x="25" y="35" width="8" height="10" fill="#333332" rx="1" />
          <rect x="37" y="35" width="8" height="10" fill="#333332" rx="1" />
          <rect x="49" y="35" width="8" height="10" fill="#333332" rx="1" />
          <rect x="61" y="35" width="8" height="10" fill="#333332" rx="1" />
          {/* Puertas inferiores */}
          <rect x="30" y="60" width="10" height="20" fill="#333332" rx="1" />
          <rect x="50" y="60" width="10" height="20" fill="#333332" rx="1" />
          {/* Techo */}
          <path d="M15 30 L45 15 L75 30 L45 15 Z" fill="#F2D020" />
          {/* Edificio secundario */}
          <rect x="70" y="50" width="20" height="30" fill="#FDEEB2" rx="2" />
          <path d="M65 50 L80 40 L95 50 L80 40 Z" fill="#F2D020" />
        </svg>
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white text-xs mb-1">Su Licencia Actual:</p>
            <h3 className="text-white text-lg font-bold">
              <span className="text-yellow-400">{licencia.tipo}</span>
            </h3>
          </div>
          <div className="bg-gray-700 text-white text-xs px-3 py-1 rounded-full">
            {licencia.periodo}
          </div>
        </div>

        {/* Fechas */}
        <div className="text-gray-400 text-xs mb-3">
          <span>Inicio: {licencia.fechaInicio}</span>{" "}
          <span className="ml-2">Fin: {licencia.fechaFin}</span>
        </div>

        {/* Días restantes */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white text-sm">Días Restantes</span>
            <span className="text-gray-400 text-sm">{licencia.diasRestantes} días</span>
          </div>
          {/* Barra de progreso */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calcularPorcentaje()}%` }}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-gray-800 hover:bg-gray-100 text-xs h-7 px-3"
          >
            Cambiar Plan
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600 text-xs h-7 px-3"
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Soporte
          </Button>
        </div>
      </div>
    </div>
  )
}


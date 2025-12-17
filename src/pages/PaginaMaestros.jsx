"use client"

import { MaestrosConfiguracion } from "../components/MaestrosConfiguracion"

export default function PaginaMaestros() {
  return (
    <div className="space-y-6 min-h-full px-18">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Maestros</h1>
          <p className="text-sm text-gray-600 mt-1 leading-tight">Gestiona materiales, acabados, categorías y más</p>
        </div>
      </div>

      {/* Componente de Maestros */}
      <MaestrosConfiguracion />
    </div>
  )
}


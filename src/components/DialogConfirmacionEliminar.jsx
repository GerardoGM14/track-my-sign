"use client"

import { Dialog, DialogContent } from "./ui/dialog"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import deleteComponentSvg from "../assets/subs/delete_component.svg"

export function DialogConfirmacionEliminar({
  open,
  onOpenChange,
  onConfirmar,
  titulo = "¿Está seguro de eliminar este elemento?",
  mensaje = "Esta acción no se puede deshacer y afectará a todos los usuarios vinculados.",
  textoConfirmar = "Eliminar",
  textoCancelar = "Cancelar",
  cargando = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border-0 shadow-xl">
        {/* Botón de cerrar */}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-1 z-10"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>

        {/* Contenido del diálogo */}
        <div className="px-6 py-3 bg-white">
          {/* Ilustración SVG */}
          <div className="flex justify-center mb-2">
            <img 
              src={deleteComponentSvg} 
              alt="Eliminar" 
              className="w-32 h-36 object-contain"
            />
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
            {titulo}
          </h3>

          {/* Mensaje de advertencia */}
          <p className="text-sm text-gray-700 text-center mb-3">
            {mensaje}
          </p>

          {/* Botones */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-8 py-2 rounded-md font-medium flex-1"
              disabled={cargando}
            >
              {textoCancelar}
            </Button>
            <Button
              onClick={onConfirmar}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-md font-medium flex-1"
              disabled={cargando}
            >
              {cargando ? "Eliminando..." : textoConfirmar}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


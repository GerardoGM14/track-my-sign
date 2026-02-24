"use client"

import { useNavigate } from "react-router-dom"

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Elementos decorativos de fondo (nubes y puntos) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-blue-100 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-100 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-blue-50 rounded-full opacity-40 blur-xl"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-blue-50 rounded-full opacity-30 blur-lg"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Ilustración SVG 404 */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/error-404.svg" 
            alt="404 Error Illustration" 
            className="w-full max-w-md h-auto"
          />
        </div>

        {/* Contenido de texto */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¡Oops! ¿Por qué estás aquí?
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            Lo sentimos mucho por la inconveniencia. Parece que estás intentando acceder a una página que ha sido eliminada o nunca existió.
          </p>
        </div>

        {/* Botón con gradiente azul */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-white font-medium text-base transition-all duration-200 transform hover:scale-105 hover:shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  )
}

export { NotFoundPage as PaginaNoEncontrada }
export default NotFoundPage

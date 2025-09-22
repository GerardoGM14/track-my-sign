"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { FaCheck, FaArrowLeft, FaBullseye, FaCog, FaChartLine, FaHandshake } from "react-icons/fa"

export function PaginaPreciosSaaS() {
  const navigate = useNavigate()
  const [planSeleccionado, setPlanSeleccionado] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isEntering, setIsEntering] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsEntering(false)
    }, 800)
  }, [])

  const planes = [
    {
      id: "starter",
      nombre: "Starter",
      precio: 9,
      descripcion: "Perfecto para tiendas pequeñas que están comenzando",
      icono: FaBullseye,
      caracteristicas: ["Any text value", "Some data", "Some data", "Another text", "Some data", "Any text value"],
      popular: true,
      color: "from-teal-400 to-cyan-500",
    },
    {
      id: "business",
      nombre: "Business",
      precio: 39,
      descripcion: "Ideal para tiendas en crecimiento",
      icono: FaCog,
      caracteristicas: ["Some data", "Any text value", "Another text", "Some data", "Any text value", "Another text"],
      popular: false,
      color: "from-blue-400 to-indigo-500",
    },
    {
      id: "professional",
      nombre: "Professional",
      precio: 59,
      descripcion: "Para tiendas con más volumen",
      icono: FaChartLine,
      caracteristicas: ["Any text value", "Some data", "Another text", "Some data", "Any text value", "Another text"],
      popular: false,
      color: "from-purple-400 to-pink-500",
    },
    {
      id: "premium",
      nombre: "Premium",
      precio: 79,
      descripcion: "Para tiendas grandes con necesidades específicas",
      icono: FaHandshake,
      caracteristicas: ["Some data", "Another text", "Any text value", "Some data", "Another text", "Any text value"],
      popular: false,
      color: "from-pink-400 to-rose-500",
    },
  ]

  const manejarSeleccionPlan = async (planId) => {
    setPlanSeleccionado(planId)

    console.log(`Plan seleccionado: ${planId}`)

    // Por ahora, simular redirección a Stripe
    alert(`Redirigiendo a Stripe para el plan ${planes.find((p) => p.id === planId)?.nombre}...`)

    // Temporal: redirigir al login después de "pagar"
    setTimeout(() => {
      navigate("/login")
    }, 2000)
  }

  const handleNavigateBack = (e) => {
    e.preventDefault()
    setIsTransitioning(true)

    setTimeout(() => {
      navigate("/register")
    }, 800)
  }

  return (
    <div
      className="min-h-screen bg-gray-50 p-4"
      style={{
        backgroundImage: `url('/images/login-background.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {isTransitioning && (
        <div
          className="fixed inset-0 bg-white z-50"
          style={{
            animation: "fadeIn 0.8s linear forwards",
          }}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes pageEnter {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .page-content {
          animation: ${
            isTransitioning ? "fadeOut 0.8s linear forwards" : isEntering ? "pageEnter 0.8s linear forwards" : "none"
          };
        }
      `}</style>

      <div className={`max-w-6xl mx-auto page-content`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={handleNavigateBack} className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-blue-600">TRACKMYSIGN</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Plans</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              You can put your text here and get more audience's attention. You can put your text here and get more
              audience's attention.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {planes.map((plan, index) => {
              const IconoComponente = plan.icono
              const esPopular = plan.popular

              return (
                <Card
                  key={plan.id}
                  className={`relative border-2 transition-all duration-300 hover:shadow-lg ${
                    esPopular
                      ? "border-teal-400 shadow-lg transform scale-105"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {esPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-teal-500 text-white px-4 py-1">Most Popular</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                    >
                      <IconoComponente className="h-8 w-8 text-white" />
                    </div>

                    <CardTitle className="text-xl font-bold text-gray-800 mb-2">{plan.nombre}</CardTitle>

                    <div className="mb-3">
                      <span className="text-sm text-gray-500">$</span>
                      <span className="text-3xl font-bold text-gray-800">{plan.precio}</span>
                      <span className="text-sm text-gray-500">/month</span>
                    </div>

                    <p className="text-sm text-gray-600">{plan.descripcion}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features List */}
                    <div className="space-y-3">
                      {[
                        "Put your first text here",
                        "Another text is here",
                        "Here is a place for text",
                        "Put your fourth text here",
                        "Another text is here",
                        "Put your last text here",
                      ].map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start justify-between">
                          <span className="text-sm text-gray-700 font-medium flex-1">{feature}</span>
                          <div className="ml-4">
                            {featureIndex < plan.caracteristicas.length ? (
                              plan.caracteristicas[featureIndex] === "Some data" ||
                              plan.caracteristicas[featureIndex] === "Any text value" ||
                              plan.caracteristicas[featureIndex] === "Another text" ? (
                                <FaCheck className="h-4 w-4 text-teal-500" />
                              ) : (
                                <span className="text-xs text-gray-500">-</span>
                              )
                            ) : (
                              <span className="text-xs text-gray-500">-</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`w-full py-3 font-medium transition-all duration-200 ${
                        esPopular
                          ? "bg-teal-500 hover:bg-teal-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                      onClick={() => manejarSeleccionPlan(plan.id)}
                      disabled={planSeleccionado === plan.id}
                    >
                      {planSeleccionado === plan.id ? "Procesando..." : "Choose Plan"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Footer Text */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Todos los precios son dinámicos y pueden ser modificados desde el panel de administración
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaginaPreciosSaaS

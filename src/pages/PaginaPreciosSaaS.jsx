"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  FaCheck,
  FaArrowLeft,
  FaBullseye,
  FaCog,
  FaChartLine,
  FaHandshake,
  FaHeadset,
  FaRocket,
  FaCreditCard,
  FaGlobe,
  FaTools,
} from "react-icons/fa"
import { FaShieldCat } from "react-icons/fa6";

export function PaginaPreciosSaaS() {
  const navigate = useNavigate()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isEntering, setIsEntering] = useState(true)
  const [planElegido, setPlanElegido] = useState(null)
  const [carruselIndex, setCarruselIndex] = useState(0)
  const [tecnologiaActual, setTecnologiaActual] = useState(0)

  const beneficios = [
    { icono: FaShieldCat, texto: "Pago Seguro", descripcion: "Encriptación SSL de nivel bancario" },
    { icono: FaHeadset, texto: "Soporte en Español", descripcion: "Atención 24/7 en tu idioma" },
    { icono: FaRocket, texto: "Setup Gratuito", descripcion: "Configuración sin costo adicional" },
    { icono: FaCreditCard, texto: "Sin Comisiones Ocultas", descripcion: "Precios transparentes siempre" },
    { icono: FaGlobe, texto: "Acceso Global", descripcion: "Disponible en todo el mundo" },
    { icono: FaTools, texto: "Herramientas Avanzadas", descripcion: "Todo lo que necesitas incluido" },
  ]

  const tecnologias = [
    {
      nombre: "TailwindCSS",
      descripcion:
        "Framework de CSS utilitario que nos permite crear interfaces modernas y responsivas de manera rápida y eficiente, garantizando un diseño consistente en toda la aplicación.",
      imagen: "/-css-logo.png",
      color: "from-cyan-50 to-blue-100",
    },
    {
      nombre: "React",
      descripcion:
        "Biblioteca de JavaScript para construir interfaces de usuario interactivas y dinámicas, proporcionando una experiencia fluida y moderna para nuestros usuarios.",
      imagen: "/react-logo.png",
      color: "from-blue-50 to-cyan-100",
    },
    {
      nombre: "Firebase",
      descripcion:
        "Plataforma de desarrollo de aplicaciones que nos proporciona una base de datos en tiempo real, autenticación segura y hosting confiable para tu aplicación.",
      imagen: "/firebase-logo.png",
      color: "from-orange-50 to-yellow-100",
    },
    {
      nombre: "Stripe",
      descripcion:
        "Procesador de pagos líder mundial que garantiza transacciones seguras y confiables, soportando múltiples métodos de pago y monedas internacionales.",
      imagen: "/stripe-logo.png",
      color: "from-purple-50 to-indigo-100",
    },
  ]

  useEffect(() => {
    setTimeout(() => {
      setIsEntering(false)
    }, 800)

    const interval = setInterval(() => {
      setCarruselIndex((prev) => (prev + 1) % beneficios.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [beneficios.length])

  const planes = [
    {
      id: "starter",
      nombre: "Starter",
      precio: 9,
      descripcion: "Perfecto para tiendas pequeñas que están comenzando",
      icono: FaBullseye,
      caracteristicas: [
        "Hasta 100 productos",
        "Dashboard básico",
        "Soporte por email",
        "Reportes mensuales",
        "1 usuario",
        "SSL incluido",
      ],
      popular: true,
      color: "from-teal-400 to-cyan-500",
    },
    {
      id: "business",
      nombre: "Business",
      precio: 39,
      descripcion: "Ideal para tiendas en crecimiento",
      icono: FaCog,
      caracteristicas: [
        "Hasta 1,000 productos",
        "Dashboard avanzado",
        "Soporte prioritario",
        "Reportes semanales",
        "5 usuarios",
        "Integraciones API",
      ],
      popular: false,
      color: "from-blue-400 to-indigo-500",
    },
    {
      id: "professional",
      nombre: "Professional",
      precio: 59,
      descripcion: "Para tiendas con más volumen",
      icono: FaChartLine,
      caracteristicas: [
        "Productos ilimitados",
        "Analytics completo",
        "Soporte 24/7",
        "Reportes diarios",
        "15 usuarios",
        "Automatizaciones",
      ],
      popular: false,
      color: "from-purple-400 to-pink-500",
    },
    {
      id: "premium",
      nombre: "Premium",
      precio: 79,
      descripcion: "Para tiendas grandes con necesidades específicas",
      icono: FaHandshake,
      caracteristicas: [
        "Todo ilimitado",
        "IA personalizada",
        "Gerente dedicado",
        "Reportes en tiempo real",
        "Usuarios ilimitados",
        "Desarrollo custom",
      ],
      popular: false,
      color: "from-pink-400 to-rose-500",
    },
  ]

  const manejarSeleccionPlan = (planId) => {
    setPlanElegido(planId)
    console.log(`Plan seleccionado: ${planId}`)
  }

  const navegarTecnologia = (direccion) => {
    if (direccion === "anterior") {
      setTecnologiaActual((prev) => (prev === 0 ? tecnologias.length - 1 : prev - 1))
    } else {
      setTecnologiaActual((prev) => (prev + 1) % tecnologias.length)
    }
  }

  const handleNavigateBack = (e) => {
    e.preventDefault()
    setIsTransitioning(true)

    setTimeout(() => {
      navigate("/register")
    }, 800)
  }

  const continuarConPlan = () => {
    if (planElegido) {
      const planSeleccionado = planes.find((p) => p.id === planElegido)
      alert(`Continuando con el plan ${planSeleccionado?.nombre}. Redirigiendo a configuración...`)
      // Aquí iría la lógica para continuar con el plan seleccionado
    }
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
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes slideIn {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .page-content {
          animation: ${
            isTransitioning ? "fadeOut 0.8s linear forwards" : isEntering ? "pageEnter 0.8s linear forwards" : "none"
          };
        }
        
        .plan-selected {
        }
        
        .carousel-item {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>

      <div className={`max-w-7xl mx-auto page-content`}>
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

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Elige Tu Plan Perfecto</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Potencia tu negocio con nuestras herramientas avanzadas. Desde pequeñas tiendas hasta grandes empresas,
              tenemos el plan ideal para hacer crecer tu negocio.
            </p>

            <div className="mt-8 h-16 flex items-center justify-center">
              <div className="carousel-item flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-8 py-4 rounded-full shadow-md">
                {React.createElement(beneficios[carruselIndex].icono, { className: "h-5 w-5 mr-3" })}
                <div className="text-left">
                  <span className="font-semibold text-lg">{beneficios[carruselIndex].texto}</span>
                  <p className="text-sm text-blue-600">{beneficios[carruselIndex].descripcion}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {planes.map((plan, index) => {
              const IconoComponente = plan.icono
              const esPopular = plan.popular
              const esElegido = planElegido === plan.id

              return (
                <Card
                  key={plan.id}
                  className={`relative border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                    esElegido
                      ? "border-green-400 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50"
                      : esPopular
                        ? "border-teal-400 shadow-lg transform scale-105 bg-gradient-to-br from-teal-50 to-cyan-50"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-lg hover:transform hover:scale-102"
                  }`}
                  onClick={() => manejarSeleccionPlan(plan.id)}
                >
                  {esElegido && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white px-4 py-1 animate-pulse">Your Choice</Badge>
                    </div>
                  )}
                  {esPopular && !esElegido && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-teal-500 text-white px-4 py-1">Most Popular</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}
                    >
                      <IconoComponente className="h-10 w-10 text-white" />
                    </div>

                    <CardTitle className="text-2xl font-bold text-gray-800 mb-2">{plan.nombre}</CardTitle>

                    <div className="mb-4">
                      <span className="text-lg text-gray-500">$</span>
                      <span className="text-4xl font-bold text-gray-800">{plan.precio}</span>
                      <span className="text-lg text-gray-500">/mes</span>
                    </div>

                    <p className="text-gray-600 leading-relaxed">{plan.descripcion}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {plan.caracteristicas.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <FaCheck className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`w-full py-4 font-semibold text-lg transition-all duration-300 ${
                        esElegido
                          ? "bg-green-500 hover:bg-green-600 text-white shadow-lg"
                          : esPopular
                            ? "bg-teal-500 hover:bg-teal-600 text-white shadow-lg"
                            : "bg-gray-800 hover:bg-gray-900 text-white hover:shadow-lg"
                      }`}
                    >
                      {esElegido ? "Plan Seleccionado" : "Seleccionar Plan"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-800 mb-6 leading-tight">
                Cómo nuestras tecnologías impulsan tu negocio
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tecnologias.slice(0, 3).map((tech, index) => {
                const techIndex = (tecnologiaActual + index) % tecnologias.length
                const tecnologia = tecnologias[techIndex]

                return (
                  <div
                    key={techIndex}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div
                      className={`h-48 bg-gradient-to-br ${tecnologia.color} flex items-center justify-center relative`}
                    >
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <img
                          src={tecnologia.imagen || "/placeholder.svg"}
                          alt={tecnologia.nombre}
                          className="h-12 w-12 object-contain"
                        />
                      </div>
                      <div className="absolute bottom-4 left-6">
                        <h4 className="text-xl font-bold text-gray-800">{tecnologia.nombre}</h4>
                      </div>
                    </div>

                    <div className="p-6">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">
                        Cómo {tecnologia.nombre} potencia tu aplicación
                      </h5>
                      <p className="text-gray-600 leading-relaxed text-sm mb-4">{tecnologia.descripcion}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={() => navegarTecnologia("anterior")}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <FaArrowLeft className="h-4 w-4 text-gray-600" />
              </button>

              <div className="flex space-x-2">
                {tecnologias.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setTecnologiaActual(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      index === tecnologiaActual ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => navegarTecnologia("siguiente")}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <FaArrowLeft className="h-4 w-4 text-gray-600 transform rotate-180" />
              </button>
            </div>
          </div>

          {planElegido && (
            <div className="text-center mb-8">
              <Button
                onClick={continuarConPlan}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continuar con {planes.find((p) => p.id === planElegido)?.nombre}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaginaPreciosSaaS

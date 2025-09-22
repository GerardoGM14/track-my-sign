"use client"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

export default function PaginaPlanes() {
  const navigate = useNavigate()
  const [planSeleccionado, setPlanSeleccionado] = useState(null)

  const planes = [
    {
      id: "starter",
      nombre: "Starter",
      precio: 29,
      descripcion: "Perfecto para tiendas pequeñas que están comenzando",
      caracteristicas: [
        "Hasta 50 cotizaciones/mes",
        "Gestión básica de clientes",
        "2 usuarios incluidos",
        "Soporte por email",
        "Almacenamiento 5GB",
      ],
      popular: false,
      simulado: true,
    },
    {
      id: "professional",
      nombre: "Professional",
      precio: 79,
      descripcion: "Ideal para tiendas en crecimiento con más volumen",
      caracteristicas: [
        "Cotizaciones ilimitadas",
        "Gestión avanzada de clientes",
        "10 usuarios incluidos",
        "Soporte prioritario",
        "Almacenamiento 50GB",
        "Portal de clientes",
        "Reportes avanzados",
      ],
      popular: true,
      simulado: true,
    },
    {
      id: "enterprise",
      nombre: "Enterprise",
      precio: 199,
      descripcion: "Para tiendas grandes con necesidades específicas",
      caracteristicas: [
        "Todo en Professional",
        "Usuarios ilimitados",
        "Soporte telefónico 24/7",
        "Almacenamiento ilimitado",
        "API personalizada",
        "Integración con sistemas existentes",
        "Gerente de cuenta dedicado",
      ],
      popular: false,
      simulado: true,
    },
  ]

  const manejarSeleccionPlan = (planId) => {
    setPlanSeleccionado(planId)
    localStorage.setItem("planSeleccionado", planId)
    navigate("/login", { state: { planSeleccionado: planId, fromPlanes: true } })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-foreground">TrackMySign</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                ¿Ya tienes cuenta?
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Plans Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Elige el Plan Perfecto para tu Tienda
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comienza con 14 días gratis. Cambia o cancela en cualquier momento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {planes.map((plan) => (
              <Card
                key={plan.id}
                className={`relative border-border bg-card hover:shadow-lg transition-all ${
                  plan.popular ? "border-primary shadow-lg scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Más Popular
                  </Badge>
                )}

                {plan.simulado && (
                  <Badge
                    variant="secondary"
                    className="absolute top-4 right-4 bg-secondary/10 text-secondary border-secondary/20"
                  >
                    Simulado
                  </Badge>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl text-card-foreground">{plan.nombre}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-card-foreground">${plan.precio}</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                  <CardDescription className="text-muted-foreground mt-2">{plan.descripcion}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-card-foreground">{caracteristica}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full py-3 ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    }`}
                    onClick={() => manejarSeleccionPlan(plan.id)}
                    disabled={planSeleccionado === plan.id}
                  >
                    {planSeleccionado === plan.id ? "Seleccionado" : "Comenzar Prueba Gratuita"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">¿Necesitas algo más específico?</p>
            <Button variant="outline" size="lg">
              Contactar Ventas
            </Button>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground text-center mb-8">Preguntas Frecuentes</h3>

            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg text-card-foreground">
                    ¿Puedo cambiar de plan en cualquier momento?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se reflejan
                    inmediatamente en tu facturación.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg text-card-foreground">¿Qué incluye la prueba gratuita?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    14 días completos con acceso a todas las funciones del plan Professional. No se requiere tarjeta de
                    crédito.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg text-card-foreground">¿Ofrecen descuentos anuales?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sí, obtienes 2 meses gratis al pagar anualmente. Contacta a nuestro equipo de ventas para más
                    detalles.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

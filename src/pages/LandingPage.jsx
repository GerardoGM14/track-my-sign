import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { CheckCircle, Users, BarChart3, FileText, Zap, Shield } from "lucide-react"
import { Link } from "react-router-dom"

export default function LandingPage() {
  const caracteristicas = [
    {
      icono: <Users className="h-8 w-8 text-primary" />,
      titulo: "Gestión de Clientes",
      descripcion: "Administra tu base de clientes y sus proyectos de manera eficiente",
    },
    {
      icono: <FileText className="h-8 w-8 text-primary" />,
      titulo: "Cotizaciones Inteligentes",
      descripcion: "Genera cotizaciones profesionales con cálculos automáticos de precios",
    },
    {
      icono: <BarChart3 className="h-8 w-8 text-primary" />,
      titulo: "Seguimiento de Órdenes",
      descripcion: "Rastrea el progreso de cada proyecto desde el diseño hasta la entrega",
    },
    {
      icono: <Zap className="h-8 w-8 text-primary" />,
      titulo: "Automatización",
      descripcion: "Automatiza procesos repetitivos y enfócate en hacer crecer tu negocio",
    },
    {
      icono: <Shield className="h-8 w-8 text-primary" />,
      titulo: "Datos Seguros",
      descripcion: "Tus datos están protegidos con la más alta seguridad en la nube",
    },
  ]

  const testimonios = [
    {
      nombre: "María González",
      empresa: "Letreros Express",
      testimonio: "TrackMySign transformó completamente nuestra operación. Ahora podemos manejar 3x más proyectos.",
      rating: 5,
    },
    {
      nombre: "Carlos Rodríguez",
      empresa: "Gráficos Pro",
      testimonio: "La mejor inversión que hemos hecho. El ROI fue inmediato desde el primer mes.",
      rating: 5,
    },
    {
      nombre: "Ana Martínez",
      empresa: "Señalética Total",
      testimonio: "Increíble cómo simplificó nuestros procesos. Nuestros clientes están más satisfechos.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-foreground">TrackMySign</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Comenzar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 bg-secondary/10 text-secondary border-secondary/20">
            🚀 El SaaS #1 para Tiendas de Letreros
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Gestiona tu Tienda de <span className="text-primary">Letreros</span> como un Profesional
          </h1>

          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Desde cotizaciones hasta entrega final. TrackMySign automatiza tu flujo de trabajo y te ayuda a hacer crecer
            tu negocio de letreros y gráficos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                Comenzar Prueba Gratuita
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg bg-transparent">
              Ver Demo en Vivo
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>14 días gratis</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Configuración en 5 minutos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Todo lo que Necesitas para Hacer Crecer tu Negocio
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Herramientas profesionales diseñadas específicamente para tiendas de letreros y gráficos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caracteristicas.map((caracteristica, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{caracteristica.icono}</div>
                  <CardTitle className="text-xl text-card-foreground">{caracteristica.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{caracteristica.descripcion}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Más de 500+ Tiendas Confían en TrackMySign
            </h2>
            <p className="text-xl text-muted-foreground">
              Descubre por qué somos la elección #1 para profesionales de letreros
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonios.map((testimonio, index) => (
              <Card key={index} className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonio.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ⭐
                      </span>
                    ))}
                  </div>
                  <CardDescription className="text-muted-foreground italic">"{testimonio.testimonio}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-semibold text-card-foreground">{testimonio.nombre}</p>
                    <p className="text-sm text-muted-foreground">{testimonio.empresa}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">¿Listo para Transformar tu Negocio?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Únete a cientos de tiendas que ya están creciendo con TrackMySign
          </p>

          <Link to="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg">
              Comenzar Ahora - Es Gratis
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground mt-4">
            Prueba gratuita de 14 días • Sin compromiso • Configuración instantánea
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-foreground">TrackMySign</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plataforma SaaS líder para tiendas de letreros y gráficos.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Demo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Estado del Sistema
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Términos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 TrackMySign. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

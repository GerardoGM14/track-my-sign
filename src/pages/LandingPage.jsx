import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  CheckCircle,
  Users,
  BarChart3,
  FileText,
  Zap,
  Shield,
  ChevronDown,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { NavLinkViewTransition } from "../components/NavLinkViewTransition"

export default function LandingPage() {
  const caracteristicas = [
    {
      icono: <Users className="h-6 w-6 text-blue-600" />,
      titulo: "Gestión de clientes y proyectos",
      descripcion: "Centraliza clientes, proyectos y comunicación en un solo lugar.",
    },
    {
      icono: <FileText className="h-6 w-6 text-blue-600" />,
      titulo: "Cotizaciones inteligentes",
      descripcion: "Crea cotizaciones precisas en minutos, con cálculos automáticos.",
    },
    {
      icono: <BarChart3 className="h-6 w-6 text-blue-600" />,
      titulo: "Seguimiento de órdenes",
      descripcion: "Visualiza el estado de cada trabajo, desde el diseño hasta la instalación.",
    },
    {
      icono: <Zap className="h-6 w-6 text-blue-600" />,
      titulo: "Automatización de tareas",
      descripcion: "Ahorra tiempo con recordatorios, flujos y notificaciones automáticas.",
    },
    {
      icono: <Shield className="h-6 w-6 text-blue-600" />,
      titulo: "Datos seguros en la nube",
      descripcion: "Tu operación protegida con buenas prácticas de seguridad.",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-foreground">
      <LandingHeader />

      {/* HERO PRINCIPAL (centrado estilo HubSpot) */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:py-20 lg:py-24">
          {/* Columna izquierda: copy principal */}
          <div className="flex flex-col justify-center space-y-6">
            <Badge
              variant="secondary"
              className="w-fit border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
            >
              Plataforma para tiendas de letreros
          </Badge>

            <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.1rem]">
              Haz crecer tu tienda de <span className="text-blue-600">señalética</span> con un sistema pensado para ti.
          </h1>

            <p className="max-w-xl text-balance text-base text-slate-700 sm:text-lg">
              TrackMySign conecta cotizaciones, órdenes, clientes y facturación en un flujo claro. Menos planillas,
              menos caos, más tiempo para producir y vender.
            </p>

            {/* CTA + info secundaria */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <NavLinkViewTransition to="/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-blue-600 px-7 text-base font-semibold text-white hover:bg-blue-700"
                >
                  Comenzar prueba gratuita
              </Button>
              </NavLinkViewTransition>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-dashed border-blue-300 bg-white text-base text-blue-600 hover:bg-blue-50 sm:w-auto"
              >
                Ver demo (espacio para video)
            </Button>
          </div>

            {/* Bullets de confianza */}
            <div className="mt-2 flex flex-col gap-3 text-sm text-slate-700 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              <span>14 días gratis</span>
            </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              <span>Sin tarjeta de crédito</span>
            </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>Onboarding en menos de 1 semana</span>
              </div>
            </div>
          </div>

          {/* Columna derecha: mockup tipo tarjetas / UI (placeholder) */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Tarjeta principal */}
              <div className="rounded-xl bg-background shadow-lg ring-1 ring-border">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">Panel de tienda</p>
                <p className="text-sm text-slate-500">Vista general de tus órdenes y cotizaciones</p>
                  </div>
                  {/* Placeholder para logo / avatar */}
                  <div className="h-9 w-9 rounded-full bg-primary/10" />
                </div>

                <div className="grid grid-cols-3 gap-4 px-5 py-4 text-xs">
                  <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200">
                    <p className="text-[0.65rem] text-slate-500">Cotizaciones activas</p>
                    <p className="mt-1 text-lg font-semibold text-primary">17</p>
                    <p className="text-[0.65rem] text-emerald-600">▲ 4 este mes</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200">
                    <p className="text-[0.65rem] text-slate-500">Órdenes en producción</p>
                    <p className="mt-1 text-lg font-semibold text-primary">8</p>
                    <p className="text-[0.65rem] text-emerald-600">▲ 2 esta semana</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200">
                    <p className="text-[0.65rem] text-slate-500">Clientes activos</p>
                    <p className="mt-1 text-lg font-semibold text-primary">156</p>
                    <p className="text-[0.65rem] text-emerald-600">▲ 12 este mes</p>
                  </div>
                </div>

                {/* Placeholder para mini timeline */}
                <div className="border-t border-slate-200 px-5 py-4">
                  <p className="mb-2 text-xs font-medium text-slate-600">Próximos hitos de producción</p>
                  <div className="space-y-2 text-[0.7rem] text-slate-600">
                    <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                      <span>Instalación rótulo exterior</span>
                      <span className="text-xs text-slate-500">Mañana</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                      <span>Entrega LEDs fachada</span>
                      <span className="text-xs text-slate-500">Viernes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta secundaria flotando (placeholder para imagen de persona / cliente) */}
              <div className="absolute -bottom-10 -left-6 hidden w-40 rounded-xl bg-blue-50 p-3 shadow-md ring-1 ring-blue-200/70 sm:block">
                <p className="text-[0.7rem] font-semibold text-blue-700">Espacio para foto de cliente</p>
                <p className="mt-1 text-[0.7rem] text-blue-600/80">
                  Aquí podemos mostrar una imagen real de una tienda usando TrackMySign.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CustomersStrip />

      {/* PLATAFORMA / CARRUSEL (inspirado en PlatformSection.tsx) */}
      <PlatformCarouselSection />

      {/* SECCIÓN: CÓMO FUNCIONA (similar a “How HubSpot works”) */}
      <section className="bg-blue-50/60">
        <div className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              Cómo TrackMySign encaja en tu día a día
            </h2>
            <p className="mb-6 text-sm text-slate-700 sm:text-base">
              Desde la primera llamada del cliente hasta la instalación final, TrackMySign te acompaña en cada paso del
              proceso. Sin hojas de cálculo sueltas ni información perdida.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                Recibe la solicitud del cliente y genera una cotización profesional en minutos.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                Convierte la cotización aprobada en orden de trabajo y asigna tareas a tu equipo.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                Haz seguimiento del estado, costos y facturación sin salir de la plataforma.
              </li>
            </ul>
          </div>

          {/* Placeholder grande para imagen / video explicativo */}
            <div className="flex items-center justify-center">
              <div className="flex h-60 w-full max-w-lg items-center justify-center rounded-2xl border border-dashed border-blue-300 bg-white/90">
              <span className="text-xs font-medium text-slate-500">
                Espacio para imagen / video “Cómo funciona TrackMySign”
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CARACTERÍSTICAS DESTACADAS */}
      <section className="bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Todo lo que necesitas para tu operación de señalética</h2>
            <p className="mt-3 text-sm text-slate-700 sm:text-base">
              TrackMySign reúne en un solo lugar las funciones clave para cotizar, producir y facturar trabajos de
              letreros y gráficos.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {caracteristicas.map((caracteristica, index) => (
              <Card
                key={index}
                className="h-full rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-sm"
              >
                <CardHeader className="flex flex-row items-start gap-3 pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {caracteristica.icono}
                  </div>
                  <div>
                    <CardTitle className="text-base">{caracteristica.titulo}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-slate-600">
                    {caracteristica.descripcion}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsCarouselSection />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  )
}

function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      {/* Barra superior utilidades */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs text-slate-500">
        <div className="hidden items-center gap-4 md:flex">
          <button className="flex items-center gap-1 hover:text-slate-700">
            Español <ChevronDown className="h-3 w-3" />
          </button>
          <span className="text-slate-300">|</span>
          <button className="hover:text-slate-700">Soporte</button>
          <span className="text-slate-300">|</span>
          <button className="hover:text-slate-700">Contactar ventas</button>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <Search className="h-4 w-4 cursor-pointer text-slate-500 hover:text-slate-800" />
          <NavLinkViewTransition to="/login">
            <button className="hover:text-slate-700">Iniciar sesión</button>
          </NavLinkViewTransition>
        </div>
        <button className="ml-auto md:hidden" onClick={() => setIsMenuOpen((v) => !v)}>
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Navegación principal */}
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <span className="text-lg font-bold">T</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">TrackMySign</span>
            </div>

            <nav className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
              <button className="flex items-center gap-1 font-medium hover:text-slate-900">
                Producto <ChevronDown className="h-3 w-3" />
              </button>
              <button className="flex items-center gap-1 font-medium hover:text-slate-900">
                Soluciones <ChevronDown className="h-3 w-3" />
              </button>
              <button className="font-medium hover:text-slate-900">Precios</button>
              <button className="flex items-center gap-1 font-medium hover:text-slate-900">
                Recursos <ChevronDown className="h-3 w-3" />
              </button>
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <NavLinkViewTransition to="/register">
              <Button
                variant="outline"
                className="border-blue-600 bg-transparent text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                Comenzar gratis
              </Button>
            </NavLinkViewTransition>
            <NavLinkViewTransition to="/register">
              <Button className="bg-blue-600 text-sm font-medium text-white hover:bg-blue-700">
                Solicitar demo
              </Button>
            </NavLinkViewTransition>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-slate-100 px-4 pb-4 pt-2 text-sm text-slate-700 md:hidden">
            <div className="flex flex-col gap-2">
              <button className="text-left hover:text-slate-900">Producto</button>
              <button className="text-left hover:text-slate-900">Soluciones</button>
              <button className="text-left hover:text-slate-900">Precios</button>
              <button className="text-left hover:text-slate-900">Recursos</button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <NavLinkViewTransition to="/login">
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  Iniciar sesión
            </Button>
              </NavLinkViewTransition>
              <NavLinkViewTransition to="/register">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Comenzar gratis</Button>
              </NavLinkViewTransition>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function CustomersStrip() {
  return (
    <section className="relative -mt-10 bg-white pb-12 pt-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-100 bg-white/90 px-6 py-6 shadow-sm">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Más de 200 tiendas de letreros se organizan con TrackMySign
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-80">
            <div className="h-6 w-20 rounded bg-slate-100" />
            <div className="h-6 w-20 rounded bg-slate-100" />
            <div className="h-6 w-20 rounded bg-slate-100" />
            <div className="h-6 w-20 rounded bg-slate-100" />
            <div className="h-6 w-20 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    </section>
  )
}

function PlatformCarouselSection() {
  const [active, setActive] = useState(0)

  const slides = [
    {
      title: "Un panel que centraliza toda tu operación.",
      description:
        "Visualiza cotizaciones, órdenes y clientes en un solo lugar. TrackMySign es tu fuente de verdad para la tienda.",
    },
    {
      title: "Cotiza más rápido, con menos errores.",
      description:
        "Crea propuestas consistentes con tus precios y márgenes. Deja de perder tiempo en hojas de cálculo.",
    },
    {
      title: "Sigue cada trabajo hasta la instalación.",
      description:
        "Desde el diseño hasta el montaje, todos saben cuál es el siguiente paso y qué está pendiente.",
    },
  ]

  return (
    <section className="bg-gradient-to-b from-blue-50/80 to-blue-100/40 py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl">La plataforma para tu tienda</h2>
          <p className="mx-auto max-w-3xl text-sm text-slate-700 sm:text-base">
            Conecta datos y herramientas para saber qué está pasando en cada proyecto, quién es responsable y qué viene
            después.
              </p>
            </div>

        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="mb-4 text-xl font-bold text-slate-900 sm:text-2xl">{slides[active].title}</h3>
            <p className="text-sm text-slate-700 sm:text-base">{slides[active].description}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-300/40">
            <div className="mb-4 h-32 rounded-2xl bg-slate-100" />
            <p className="text-xs text-slate-500">
              Espacio para captura de pantalla o mockup de TrackMySign (dashboard, lista de órdenes, etc.).
            </p>
          </div>
            </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-slate-300"
            onClick={() => setActive((active - 1 + slides.length) % slides.length)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                className={`h-2 rounded-full transition-all ${
                  index === active ? "w-8 bg-slate-900" : "w-2 bg-slate-300"
                }`}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-slate-300"
            onClick={() => setActive((active + 1) % slides.length)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

function TestimonialsCarouselSection() {
  const testimonios = [
    {
      nombre: "María González",
      empresa: "Letreros Express",
      testimonio: "TrackMySign transformó completamente nuestra operación. Ahora podemos manejar 3x más proyectos.",
    },
    {
      nombre: "Carlos Rodríguez",
      empresa: "Gráficos Pro",
      testimonio: "La mejor inversión que hemos hecho. El ROI fue inmediato desde el primer mes.",
    },
    {
      nombre: "Ana Martínez",
      empresa: "Señalética Total",
      testimonio: "Increíble cómo simplificó nuestros procesos. Nuestros clientes están más satisfechos.",
    },
  ]

  const [current, setCurrent] = useState(0)

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl">Tiendas reales, resultados reales</h2>
          <p className="text-sm text-slate-700 sm:text-base">
            Más de 500 tiendas ya usan TrackMySign para organizar su día a día y crecer sin perder el control.
          </p>
            </div>

        <div className="relative rounded-2xl bg-blue-50 p-10">
          <div className="mb-4 flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-lg text-yellow-400">
                ★
              </span>
            ))}
          </div>
          <blockquote className="mb-6 text-xl font-medium text-slate-900">
            "{testimonios[current].testimonio}"
          </blockquote>
            <div>
            <div className="text-sm font-semibold text-slate-900">{testimonios[current].nombre}</div>
            <div className="text-xs text-slate-600">{testimonios[current].empresa}</div>
            </div>
          </div>

        <div className="mt-6 flex justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-slate-300"
            onClick={() => setCurrent((current - 1 + testimonios.length) % testimonios.length)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-slate-300"
            onClick={() => setCurrent((current + 1) % testimonios.length)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          </div>
        </div>
    </section>
  )
}

function FinalCtaSection() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-20 text-white">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">¿Listo para ver TrackMySign en acción?</h2>
        <p className="mt-3 text-sm sm:text-base">
          Únete a las tiendas que ya cotizan, producen y facturan de forma más ordenada con TrackMySign.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
          <NavLinkViewTransition to="/register">
            <Button size="lg" variant="secondary" className="bg-white px-8 text-blue-600 hover:bg-slate-100">
              Crear cuenta gratuita
            </Button>
          </NavLinkViewTransition>
          <NavLinkViewTransition to="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-white bg-transparent text-white hover:bg-white hover:text-blue-700"
            >
              Ya tengo cuenta
            </Button>
          </NavLinkViewTransition>
        </div>

        <p className="mt-4 text-xs text-blue-100">
          Prueba sin compromiso • Puedes cancelar en cualquier momento • Soporte para ayudarte a empezar
        </p>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white">
            <span className="text-[0.7rem] font-bold">T</span>
          </div>
          <span className="font-semibold">TrackMySign</span>
        </div>
        <p className="text-[0.7rem]">
          &copy; {new Date().getFullYear()} TrackMySign. Todos los derechos reservados.
        </p>
        </div>
      </footer>
  )
}

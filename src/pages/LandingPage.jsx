import { useState, useEffect, useRef } from "react"
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
import mountain from "../assets/mountain.svg"


export default function LandingPage() {
  // Importar imágenes si existen (opcional - se pueden usar rutas directas también)
  const caracteristicas = [
    {
      icono: <Users className="h-6 w-6 text-blue-600" />,
      titulo: "Gestión de clientes y proyectos",
      descripcion: "Centraliza clientes, proyectos y comunicación en un solo lugar.",
      imagen: "/landing/caracteristicas/gestion-clientes.webp", // Ruta: public/landing/caracteristicas/gestion-clientes.jpg
    },
    {
      icono: <FileText className="h-6 w-6 text-blue-600" />,
      titulo: "Cotizaciones inteligentes",
      descripcion: "Crea cotizaciones precisas en minutos, con cálculos automáticos.",
      imagen: "/landing/caracteristicas/cotizaciones.webp", // Ruta: public/landing/caracteristicas/cotizaciones.jpg
    },
    {
      icono: <BarChart3 className="h-6 w-6 text-blue-600" />,
      titulo: "Seguimiento de órdenes",
      descripcion: "Visualiza el estado de cada trabajo, desde el diseño hasta la instalación.",
      imagen: "/landing/caracteristicas/seguimiento-ordenes.webp", // Ruta: public/landing/caracteristicas/seguimiento-ordenes.jpg
    },
    {
      icono: <Zap className="h-6 w-6 text-blue-600" />,
      titulo: "Automatización de tareas",
      descripcion: "Ahorra tiempo con recordatorios, flujos y notificaciones automáticas.",
      imagen: "/landing/caracteristicas/automatizacion1.webp", // Ruta: public/landing/caracteristicas/automatizacion.jpg
    },
    {
      icono: <Shield className="h-6 w-6 text-blue-600" />,
      titulo: "Datos seguros en la nube",
      descripcion: "Tu operación protegida con buenas prácticas de seguridad.",
      imagen: "/landing/caracteristicas/seguridad.webp", // Ruta: public/landing/caracteristicas/seguridad.jpg
    },
  ]

  return (
    <div className="min-h-screen bg-white text-foreground">
      <LandingHeader />

      {/* HERO PRINCIPAL (centrado estilo HubSpot) */}
      <section className="relative bg-gradient-to-br from-blue-50 to-orange-50 overflow-hidden min-h-[600px] sm:min-h-[700px] flex items-center">
        {/* Ilustraciones decorativas al fondo */}
        <img
          src={mountain}
          alt="Decoración montañosa"
          className="pointer-events-none select-none absolute bottom-0 right-0 w-[200px] sm:w-[300px] md:w-[400px] opacity-15 blur-sm z-0"
          style={{
            filter: 'grayscale(100%) brightness(0.7) contrast(1.2)',
          }}
        />
        <img
          src={mountain}
          alt="Decoración montañosa reflejada"
          className="pointer-events-none select-none absolute bottom-0 left-0 w-[200px] sm:w-[300px] md:w-[400px] opacity-15 blur-sm z-0 transform -scale-x-100"
          style={{
            filter: 'grayscale(100%) brightness(0.7) contrast(1.2)',
          }}
        />
        <div className="container mx-auto grid gap-8 lg:gap-16 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 relative z-10 max-w-7xl">
          {/* Columna izquierda: copy principal */}
          <div className="flex flex-col justify-center space-y-6 sm:space-y-7 order-2 md:order-1">
            <Badge
              variant="secondary"
              className="w-fit border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 rounded-full mb-2"
            >
              ✨ Plataforma para tiendas de letreros
          </Badge>

            <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-[3.1rem] font-bold tracking-tight text-slate-900 leading-tight">
              Haz crecer tu tienda de <span className="text-blue-600">señalética</span> con un sistema pensado para ti.
          </h1>

            <p className="max-w-xl text-balance text-base sm:text-lg text-slate-700 leading-relaxed">
              TrackMySign conecta cotizaciones, órdenes, clientes y facturación en un flujo claro. Menos planillas,
              menos caos, más tiempo para producir y vender.
            </p>

            {/* CTA + info secundaria */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
              <NavLinkViewTransition to="/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-blue-600 px-7 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all rounded-xl"
                >
                  Comenzar prueba gratuita
              </Button>
              </NavLinkViewTransition>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-blue-300 bg-white/80 backdrop-blur-sm text-sm sm:text-base text-blue-600 hover:bg-blue-50 rounded-xl px-7 sm:px-8 py-5 sm:py-6 font-medium"
              >
                Ver demo
            </Button>
          </div>

            {/* Bullets de confianza */}
            <div className="mt-2 sm:mt-4 flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm text-slate-700 sm:flex-row sm:items-center flex-wrap">
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <span className="font-medium">14 días gratis</span>
            </div>
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <span className="font-medium">Sin tarjeta de crédito</span>
            </div>
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <span className="font-medium">Onboarding rápido</span>
              </div>
            </div>
          </div>

          {/* Columna derecha: mockup tipo tarjetas / UI (placeholder) */}
          <div className="flex items-center justify-center order-1 md:order-2">
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Tarjeta principal */}
              <div className="rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/50 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 sm:px-5 py-3.5 sm:py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Panel de tienda</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Vista general de tus órdenes y cotizaciones</p>
                  </div>
                  {/* Placeholder para logo / avatar */}
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 ml-3 shadow-md" />
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 px-4 sm:px-5 py-4 sm:py-5 bg-white">
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 via-blue-50/50 to-white p-3 sm:p-3.5 shadow-md ring-1 ring-blue-100/50 hover:shadow-lg transition-shadow">
                    <p className="text-[10px] sm:text-[0.65rem] text-slate-600 font-semibold mb-1.5 leading-tight">Cotizaciones activas</p>
                    <p className="mt-1 text-xl sm:text-2xl font-bold text-blue-600 leading-none">17</p>
                    <p className="text-[10px] sm:text-[0.65rem] text-emerald-600 font-semibold mt-1.5">▲ 4 este mes</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-orange-50 via-orange-50/50 to-white p-3 sm:p-3.5 shadow-md ring-1 ring-orange-100/50 hover:shadow-lg transition-shadow">
                    <p className="text-[10px] sm:text-[0.65rem] text-slate-600 font-semibold mb-1.5 leading-tight">Órdenes en producción</p>
                    <p className="mt-1 text-xl sm:text-2xl font-bold text-orange-600 leading-none">8</p>
                    <p className="text-[10px] sm:text-[0.65rem] text-emerald-600 font-semibold mt-1.5">▲ 2 esta semana</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-green-50 via-green-50/50 to-white p-3 sm:p-3.5 shadow-md ring-1 ring-green-100/50 hover:shadow-lg transition-shadow">
                    <p className="text-[10px] sm:text-[0.65rem] text-slate-600 font-semibold mb-1.5 leading-tight">Clientes activos</p>
                    <p className="mt-1 text-xl sm:text-2xl font-bold text-green-600 leading-none">156</p>
                    <p className="text-[10px] sm:text-[0.65rem] text-emerald-600 font-semibold mt-1.5">▲ 12 este mes</p>
                  </div>
                </div>

                {/* Placeholder para mini timeline */}
                <div className="border-t border-slate-200 bg-gradient-to-b from-slate-50/50 to-white px-4 sm:px-5 py-3.5 sm:py-4">
                  <p className="mb-2.5 text-xs font-bold text-slate-700 uppercase tracking-wide">Próximos hitos de producción</p>
                  <div className="space-y-2 text-[11px] sm:text-[0.7rem] text-slate-600">
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <span className="truncate pr-2 font-medium">Instalación rótulo exterior</span>
                      <span className="text-xs text-slate-500 font-semibold whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-full">Mañana</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <span className="truncate pr-2 font-medium">Entrega LEDs fachada</span>
                      <span className="text-xs text-slate-500 font-semibold whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-full">Viernes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta secundaria flotando (placeholder para imagen de persona / cliente) */}
              <div className="absolute -bottom-6 -left-3 sm:-left-6 hidden lg:block w-40 sm:w-44 rounded-xl bg-gradient-to-br from-blue-50 via-blue-100/80 to-blue-50 p-3.5 shadow-xl ring-2 ring-blue-200/50 border border-blue-200/70 backdrop-blur-sm">
                <p className="text-[10px] sm:text-[0.7rem] font-bold text-blue-900 mb-1.5">Espacio para foto de cliente</p>
                <p className="text-[9px] sm:text-[0.7rem] text-blue-800/90 leading-snug">
                  Aquí podemos mostrar una imagen real de una tienda usando TrackMySign.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CustomersStrip />

      {/* ESTADÍSTICAS RÁPIDAS */}
      <StatsSection />

      {/* PLATAFORMA / CARRUSEL (inspirado en PlatformSection.tsx) */}
      <PlatformCarouselSection />

      {/* SECCIÓN: CÓMO FUNCIONA - Con gráfico de dona interactivo */}
      <HowItWorksSection />

      {/* CARACTERÍSTICAS DESTACADAS - CARRUSEL */}
      <FeaturesCarouselSection caracteristicas={caracteristicas} />

      <TestimonialsCarouselSection />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  )
}

function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-700/95 backdrop-blur shadow-lg">
      {/* Barra superior utilidades */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs text-slate-300">
        <div className="hidden items-center gap-4 md:flex">
          <button className="flex items-center gap-1 hover:text-white transition-colors">
            Español <ChevronDown className="h-3 w-3" />
          </button>
          <span className="text-slate-500">|</span>
          <button className="hover:text-white transition-colors">Soporte</button>
          <span className="text-slate-500">|</span>
          <button className="hover:text-white transition-colors">Contactar ventas</button>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <Search className="h-4 w-4 cursor-pointer text-slate-300 hover:text-white transition-colors" />
          <NavLinkViewTransition to="/login">
            <button className="hover:text-white transition-colors">Iniciar sesión</button>
          </NavLinkViewTransition>
        </div>
        <button className="ml-auto md:hidden text-white" onClick={() => setIsMenuOpen((v) => !v)}>
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Navegación principal */}
      <div className="border-t border-slate-600">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                <span className="text-lg font-bold">T</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">TrackMySign</span>
            </div>

            <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
              <button className="flex items-center gap-1 font-medium hover:text-white transition-colors">
                Producto <ChevronDown className="h-3 w-3" />
              </button>
              <button className="flex items-center gap-1 font-medium hover:text-white transition-colors">
                Soluciones <ChevronDown className="h-3 w-3" />
              </button>
              <button className="font-medium hover:text-white transition-colors">Precios</button>
              <button className="flex items-center gap-1 font-medium hover:text-white transition-colors">
                Recursos <ChevronDown className="h-3 w-3" />
              </button>
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <NavLinkViewTransition to="/register">
              <Button
                variant="outline"
                className="border-slate-500 bg-transparent text-sm font-medium text-white hover:bg-slate-600 hover:border-slate-400"
              >
                Comenzar gratis
              </Button>
            </NavLinkViewTransition>
            <NavLinkViewTransition to="/register">
              <Button className="bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 shadow-md">
                Solicitar demo
              </Button>
            </NavLinkViewTransition>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-slate-600 px-4 pb-4 pt-2 text-sm text-slate-200 md:hidden bg-slate-800">
            <div className="flex flex-col gap-2">
              <button className="text-left hover:text-white transition-colors">Producto</button>
              <button className="text-left hover:text-white transition-colors">Soluciones</button>
              <button className="text-left hover:text-white transition-colors">Precios</button>
              <button className="text-left hover:text-white transition-colors">Recursos</button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <NavLinkViewTransition to="/login">
                <Button variant="outline" className="w-full border-slate-500 text-white hover:bg-slate-600">
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
  const tecnologias = [
    { 
      nombre: "React", 
      color: "from-blue-400 to-blue-600", 
      icono: "⚛️",
      logo: "/landing/tecnologias/react.webp"
    },
    { 
      nombre: "Vite", 
      color: "from-purple-400 to-purple-600", 
      icono: "⚡",
      logo: "/landing/tecnologias/vite.webp"
    },
    { 
      nombre: "Tailwind CSS", 
      color: "from-cyan-400 to-cyan-600", 
      icono: "🎨",
      logo: "/landing/tecnologias/tailwind.webp"
    },
    { 
      nombre: "Firebase", 
      color: "from-orange-400 to-orange-600", 
      icono: "🔥",
      logo: "/landing/tecnologias/firebase.webp"
    },
    { 
      nombre: "TypeScript", 
      color: "from-blue-500 to-blue-700", 
      icono: "📘",
      logo: "/landing/tecnologias/typescript.webp"
    },
    { 
      nombre: "React Router", 
      color: "from-red-400 to-red-600", 
      icono: "🛣️",
      logo: "/landing/tecnologias/react-router.webp"
    },
    { 
      nombre: "Lucide Icons", 
      color: "from-green-400 to-green-600", 
      icono: "✨",
      logo: "/landing/tecnologias/lucide.webp"
    },
    { 
      nombre: "Stripe", 
      color: "from-indigo-400 to-indigo-600", 
      icono: "💳",
      logo: "/landing/tecnologias/stripe.webp"
    },
  ]

  // Duplicar tecnologías para efecto infinito continuo (4 copias para transición perfecta)
  const tecnologiasDuplicadas = [...tecnologias, ...tecnologias, ...tecnologias, ...tecnologias]

  return (
    <>
      <style>{`
        @keyframes scroll-tech-infinite {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 4));
          }
        }
        .tech-scroll-infinite {
          animation: scroll-tech-infinite ${tecnologias.length * 2.5}s linear infinite;
          display: flex;
          width: fit-content;
          will-change: transform;
        }
        .tech-scroll-infinite:hover {
          animation-play-state: paused;
        }
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }
      `}</style>
      <section className="relative -mt-10 bg-white pb-12 pt-16 overflow-hidden">
      <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl rounded-3xl border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-orange-50/30 px-8 py-8 shadow-lg backdrop-blur-sm">
            <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              Construido con las mejores tecnologías
            </p>
            
            {/* Carrusel infinito */}
            <div className="relative overflow-hidden mask-fade-edges">
              <div className="flex gap-8 md:gap-12 tech-scroll-infinite items-center">
                {tecnologiasDuplicadas.map((tech, index) => {
                  // Tamaños personalizados: React = extra grande; Firebase, TypeScript y Vite = grande; React Router y Tailwind = pequeño; resto = mediano
                  const isExtraLarge = tech.nombre === "React"
                  const isLarge = tech.nombre === "Firebase" || tech.nombre === "TypeScript" || tech.nombre === "Vite"
                  const isSmall = tech.nombre === "React Router" || tech.nombre === "Tailwind CSS"
                  
                  const heightClass = isExtraLarge
                    ? "h-14 md:h-20"
                    : isLarge 
                    ? "h-12 md:h-16" 
                    : isSmall
                    ? "h-6 md:h-10"
                    : "h-10 md:h-14"
                  
                  return (
                    <div
                      key={`${tech.nombre}-${index}`}
                      className={`flex-shrink-0 flex items-center justify-center relative ${heightClass}`}
                    >
                      {/* Logo de la tecnología */}
                      <img 
                        src={tech.logo} 
                        alt={`${tech.nombre} logo`}
                        className="h-full w-auto max-w-none object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                        style={{ height: '100%' }}
                        loading="lazy"
                        onError={(e) => {
                          // Si el logo no existe, ocultar imagen y mostrar emoji
                          e.target.style.display = 'none'
                          const fallback = e.target.nextElementSibling
                          if (fallback) {
                            fallback.style.display = 'flex'
                            fallback.style.alignItems = 'center'
                            fallback.style.justifyContent = 'center'
                            fallback.style.height = '100%'
                          }
                        }}
                      />
                      {/* Fallback con emoji si no hay logo */}
                      <div className={`${isExtraLarge ? 'text-4xl md:text-5xl' : isLarge ? 'text-3xl md:text-4xl' : isSmall ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'} hidden tech-fallback opacity-70 items-center justify-center h-full`}>
                        {tech.icono}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// Hook personalizado para animar contadores
function useCountUp(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasStarted, startOnView])

  useEffect(() => {
    if (!hasStarted) return

    let startTime = null
    const startValue = 0

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function para que desacelere al final
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(startValue + (end - startValue) * easeOutQuart)
      
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, hasStarted])

  return { count, ref }
}

// Componente para cada stat con animación
function AnimatedStat({ valor, sufijo, etiqueta, color, delay = 0 }) {
  const { count, ref } = useCountUp(valor, 2000 + delay)
  
  return (
    <div 
      ref={ref}
      className="text-center p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:shadow-lg transition-all"
    >
      <div className={`text-4xl md:text-5xl font-bold ${color} mb-2 tabular-nums`}>
        {count.toLocaleString()}{sufijo}
      </div>
      <div className="text-sm font-medium text-slate-600">
        {etiqueta}
      </div>
    </div>
  )
}

function StatsSection() {
  const stats = [
    { valor: 500, sufijo: "+", etiqueta: "Usuarios Activos", color: "text-blue-600", delay: 0 },
    { valor: 15, sufijo: "K+", etiqueta: "Cotizaciones Creadas", color: "text-orange-600", delay: 100 },
    { valor: 98, sufijo: "%", etiqueta: "Satisfacción Cliente", color: "text-green-600", delay: 200 },
    { valor: 3, sufijo: "x", etiqueta: "Más Eficiencia", color: "text-pink-600", delay: 300 },
  ]

  return (
    <section className="bg-white pt-8 pb-16">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Título de la sección */}
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-green-100 text-green-700 border-green-200 rounded-full px-4 py-1.5 text-xs font-semibold">
            Resultados Comprobados
          </Badge>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-3">
            Números que hablan por sí solos
          </h2>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            Únete a los usuarios que ya optimizaron su flujo de trabajo con TrackMySign
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <AnimatedStat
              key={index}
              valor={stat.valor}
              sufijo={stat.sufijo}
              etiqueta={stat.etiqueta}
              color={stat.color}
              delay={stat.delay}
            />
          ))}
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
        "Visualiza cotizaciones, órdenes y clientes en un solo lugar. TrackMySign es tu fuente de verdad para tu negocio.",
      // Ruta: public/landing/plataforma/dashboard.webp
      imagen: "/landing/plataforma/dashboard.webp",
      icono: <BarChart3 className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Cotiza más rápido, con menos errores.",
      description:
        "Crea propuestas consistentes con tus precios y márgenes. Deja de perder tiempo en hojas de cálculo.",
      // Ruta: public/landing/plataforma/cotizaciones.webp
      imagen: "/landing/plataforma/cotizaciones.webp",
      icono: <FileText className="w-8 h-8 text-orange-600" />,
    },
    {
      title: "Sigue cada trabajo hasta la instalación.",
      description:
        "Desde el diseño hasta el montaje, todos saben cuál es el siguiente paso y qué está pendiente.",
      // Ruta: public/landing/plataforma/seguimiento.webp
      imagen: "/landing/plataforma/seguimiento.webp",
      icono: <CheckCircle className="w-8 h-8 text-green-600" />,
    },
  ]

  return (
    <section className="relative bg-gradient-to-b from-blue-50/80 to-blue-100/40 py-20 overflow-hidden">
      {/* SVGs decorativos difuminados */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Círculos grandes difuminados */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-orange-200/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />
        
        {/* Formas geométricas SVG difuminadas */}
        <svg className="absolute top-10 right-10 w-64 h-64 text-blue-300/20 blur-sm" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <circle cx="100" cy="100" r="20" fill="currentColor" opacity="0.2" />
        </svg>
        
        <svg className="absolute bottom-20 left-10 w-48 h-48 text-orange-300/15 blur-sm" viewBox="0 0 200 200" fill="none">
          <path d="M100 20 L180 100 L100 180 L20 100 Z" stroke="currentColor" strokeWidth="2" opacity="0.4" />
          <path d="M100 50 L150 100 L100 150 L50 100 Z" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        </svg>
        
        <svg className="absolute top-1/3 left-1/4 w-32 h-32 text-green-300/15 blur-sm" viewBox="0 0 100 100" fill="none">
          <polygon points="50,10 90,90 10,90" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
        </svg>
        
        {/* Líneas onduladas decorativas */}
        <svg className="absolute bottom-0 left-0 w-full h-40 text-blue-200/10" viewBox="0 0 1200 150" preserveAspectRatio="none">
          <path d="M0,75 Q300,25 600,75 T1200,75" stroke="currentColor" strokeWidth="3" fill="none" className="blur-sm" />
          <path d="M0,100 Q300,50 600,100 T1200,100" stroke="currentColor" strokeWidth="2" fill="none" className="blur-sm" opacity="0.5" />
        </svg>
        
        {/* Puntos flotantes */}
        <div className="absolute top-20 left-1/2 w-3 h-3 bg-blue-400/30 rounded-full blur-sm" />
        <div className="absolute top-40 right-1/4 w-4 h-4 bg-orange-400/25 rounded-full blur-sm" />
        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-purple-400/30 rounded-full blur-sm" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 rounded-full px-4 py-1.5 text-xs font-semibold">
            Plataforma Integral
          </Badge>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">La plataforma para tu negocio</h2>
          <p className="mx-auto max-w-3xl text-base text-slate-700 leading-relaxed">
            Conecta datos y herramientas para saber qué está pasando en cada proyecto, quién es responsable y qué viene
            después.
          </p>
        </div>

        <div className="grid gap-10 lg:gap-16 md:grid-cols-2 md:items-center">
          {/* Imagen/Mockup del slide - IZQUIERDA */}
          <div className="order-2 md:order-1">
            <div className="relative group">
              {/* Efecto de brillo detrás */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-orange-400/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
              
              <div className="relative rounded-2xl border-2 border-slate-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-sm overflow-hidden">
                {/* Barra superior tipo navegador */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-6 bg-slate-100 rounded-lg flex items-center px-3">
                      <span className="text-[10px] text-slate-400">trackmysign.app/dashboard</span>
                    </div>
                  </div>
                </div>
                
                {/* Contenedor de imagen */}
                <div className="relative h-56 sm:h-64 lg:h-72 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                  <img 
                    src={slides[active].imagen}
                    alt={slides[active].title}
                    className="w-full h-full object-cover object-top transition-opacity duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      const placeholder = e.target.nextElementSibling
                      if (placeholder) placeholder.style.display = 'flex'
                    }}
                  />
                  {/* Placeholder cuando no hay imagen */}
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50"
                    style={{ display: 'none' }}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4 ring-2 ring-slate-100">
                      {slides[active].icono}
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Imagen pendiente</p>
                    <p className="text-xs text-slate-400 text-center px-4">
                      Sube: {slides[active].imagen?.replace('/landing/plataforma/', '')}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-2">
                      public/landing/plataforma/
                    </p>
                  </div>
                  
                  {/* Efecto de reflejo en la parte inferior */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/80 to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Contenido del slide - DERECHA */}
          <div className="order-1 md:order-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
                {slides[active].icono}
              </div>
              <div className="flex gap-1">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === active ? "w-8 bg-blue-600" : "w-1.5 bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <h3 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl leading-tight">
              {slides[active].title}
            </h3>
            <p className="text-base text-slate-700 leading-relaxed mb-6">
              {slides[active].description}
            </p>
            
            {/* Botones de navegación */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-slate-300 hover:bg-white hover:border-blue-300 transition-all"
                onClick={() => setActive((active - 1 + slides.length) % slides.length)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-slate-300 hover:bg-white hover:border-blue-300 transition-all"
                onClick={() => setActive((active + 1) % slides.length)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <span className="text-sm text-slate-500 ml-2">
                {active + 1} / {slides.length}
              </span>
            </div>
          </div>
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
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600 py-24 text-white overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 opacity-10">
        <img
          src={mountain}
          alt="Decoración"
          className="absolute bottom-0 right-0 w-[400px] blur-2xl"
          style={{
            filter: 'grayscale(100%) brightness(2)',
          }}
        />
      </div>
      <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4">¿Listo para ver TrackMySign en acción?</h2>
        <p className="mt-3 text-base sm:text-lg text-blue-50 max-w-2xl mx-auto">
          Únete a las tiendas que ya cotizan, producen y facturan de forma más ordenada con TrackMySign.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center">
          <NavLinkViewTransition to="/register">
            <Button size="lg" variant="secondary" className="bg-white px-10 py-6 text-blue-600 hover:bg-slate-100 font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all">
              Crear cuenta gratuita
            </Button>
          </NavLinkViewTransition>
          <NavLinkViewTransition to="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-700 px-10 py-6 font-semibold rounded-xl"
            >
              Ya tengo cuenta
            </Button>
          </NavLinkViewTransition>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-blue-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Prueba sin compromiso</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Puedes cancelar en cualquier momento</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Soporte para ayudarte a empezar</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesCarouselSection({ caracteristicas }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [slidesToShow, setSlidesToShow] = useState(1)

  const colores = [
    "bg-blue-50 border-blue-200",
    "bg-orange-50 border-orange-200",
    "bg-green-50 border-green-200",
    "bg-pink-50 border-pink-200",
    "bg-purple-50 border-purple-200"
  ]

  // Detectar número de slides visibles según el tamaño de pantalla
  useEffect(() => {
    const updateSlidesToShow = () => {
      if (window.innerWidth >= 1024) {
        setSlidesToShow(3)
      } else if (window.innerWidth >= 768) {
        setSlidesToShow(2)
      } else {
        setSlidesToShow(1)
      }
    }

    updateSlidesToShow()
    window.addEventListener('resize', updateSlidesToShow)
    return () => window.removeEventListener('resize', updateSlidesToShow)
  }, [])

  // Auto-play del carrusel
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, caracteristicas.length - slidesToShow)
        return prev >= maxIndex ? 0 : prev + 1
      })
    }, 5000) // Cambia cada 5 segundos

    return () => clearInterval(interval)
  }, [isAutoPlaying, caracteristicas.length, slidesToShow])

  const nextSlide = () => {
    setIsAutoPlaying(false)
    const maxIndex = Math.max(0, caracteristicas.length - slidesToShow)
    setCurrentIndex((prev) => prev >= maxIndex ? 0 : prev + 1)
  }

  const prevSlide = () => {
    setIsAutoPlaying(false)
    const maxIndex = Math.max(0, caracteristicas.length - slidesToShow)
    setCurrentIndex((prev) => prev <= 0 ? maxIndex : prev - 1)
  }

  const goToSlide = (index) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  return (
    <section className="relative bg-gradient-to-b from-white to-slate-50 py-20 overflow-hidden">
      {/* Elementos decorativos de fondo - estilo Atlassian */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Círculos decorativos flotantes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-40 right-20 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-purple-100/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        
        {/* Formas geométricas SVG decorativas */}
        <svg className="absolute top-10 right-10 w-32 h-32 text-blue-200/40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
          <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.2" />
          <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.4" />
        </svg>
        
        <svg className="absolute bottom-10 left-10 w-40 h-40 text-orange-200/30" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 10 L110 60 L60 110 L10 60 Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
          <path d="M60 30 L90 60 L60 90 L30 60 Z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.2" />
        </svg>

        {/* Líneas curvas decorativas */}
        <svg className="absolute top-1/2 left-0 w-full h-64 text-slate-200/20" viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,100 Q300,50 600,100 T1200,100" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
          <path d="M0,120 Q300,70 600,120 T1200,120" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.2" />
        </svg>
      </div>

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="mb-12 text-center max-w-3xl mx-auto relative">
          {/* Elemento decorativo pequeño detrás del badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-24 bg-blue-100/20 rounded-full blur-2xl" />
          
          <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200 rounded-full px-4 py-1.5 text-xs font-semibold relative z-10">
            Funcionalidades
          </Badge>
          <h2 className="text-3xl font-bold sm:text-4xl mb-4 text-slate-900 relative z-10">Todo lo que necesitas para tu operación de señalética</h2>
          <p className="text-base text-slate-700 leading-relaxed relative z-10">
            TrackMySign reúne en un solo lugar las funciones clave para cotizar, producir y facturar trabajos de
            letreros y gráficos.
          </p>
        </div>

        {/* Carrusel profesional con contenedor decorativo */}
        <div className="relative group">
          {/* Contenedor decorativo alrededor del carrusel */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-50/50 via-orange-50/30 to-purple-50/50 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
          
          {/* Formas decorativas alrededor del carrusel */}
          <div className="absolute -top-6 -left-6 w-20 h-20 bg-blue-200/20 rounded-full blur-md" />
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-orange-200/20 rounded-full blur-md" />
          
          {/* SVG decorativo en esquina superior derecha */}
          <svg className="absolute -top-8 -right-8 w-32 h-32 text-blue-300/20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 L90 50 L50 90 L10 50 Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
            <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
          </svg>
          
          {/* Contenedor del carrusel con padding para los botones */}
          <div className="relative rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-2xl">
            {/* Elementos decorativos dentro del contenedor */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-orange-400 to-purple-400 opacity-60 z-10" />
            
            {/* Círculos decorativos pequeños en las esquinas */}
            <div className="absolute top-4 right-4 w-3 h-3 bg-blue-400/30 rounded-full z-10" />
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-orange-400/30 rounded-full z-10" />
            
            {/* Contenedor interno con padding y overflow */}
            <div className="px-12 md:px-16 lg:px-20 py-6 overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ 
                  transform: `translateX(calc(-${currentIndex} * (100% / ${slidesToShow})))`
                }}
              >
                {caracteristicas.map((caracteristica, index) => (
                  <div 
                    key={index} 
                    className="flex-shrink-0 px-3"
                    style={{ 
                      width: `calc(100% / ${slidesToShow})`,
                      minWidth: `calc(100% / ${slidesToShow})`
                    }}
                  >
                  <Card
                    className={`h-full rounded-2xl border-2 ${colores[index]} bg-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden group relative`}
                  >
                    {/* Elemento decorativo en la esquina superior derecha de cada card */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Línea decorativa sutil en el borde superior */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* Imagen destacada */}
                    <div className="relative h-48 sm:h-56 lg:h-64 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                      {/* Elementos decorativos sobre la imagen */}
                      <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                      <div className="absolute bottom-2 left-2 w-12 h-12 bg-blue-200/20 rounded-full blur-lg" />
                      
                      {/* Patrón decorativo sutil */}
                      <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <pattern id={`pattern-${index}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="10" cy="10" r="1" fill="currentColor" />
                          </pattern>
                        </defs>
                        <rect width="100" height="100" fill={`url(#pattern-${index})`} />
                      </svg>
                      <img 
                        src={caracteristica.imagen} 
                        alt={caracteristica.titulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          // Si la imagen no existe, ocultar y mostrar placeholder
                          e.target.style.display = 'none'
                          const placeholder = e.target.nextElementSibling
                          if (placeholder) placeholder.style.display = 'flex'
                        }}
                      />
                      {/* Placeholder cuando no hay imagen o falla la carga */}
                      <div 
                        className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <div className="w-20 h-20 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl mb-4 ring-2 ring-slate-200">
                          {caracteristica.icono}
                        </div>
                        <p className="text-sm text-slate-700 font-semibold px-4 text-center mb-1">
                          Imagen pendiente
                        </p>
                        <p className="text-xs text-slate-500 px-4 text-center">
                          Sube: {caracteristica.imagen?.replace('/landing/caracteristicas/', '')}
                        </p>
                        <p className="text-[10px] text-slate-400 px-4 text-center mt-2">
                          public/landing/caracteristicas/
                        </p>
                      </div>
                      {/* Overlay sutil en hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <CardHeader className="flex flex-row items-start gap-4 pb-3 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-slate-200 flex-shrink-0">
                        {caracteristica.icono}
                      </div>
                      <div className="flex-1 w-full">
                        <CardTitle className="text-xl font-bold text-slate-900 mb-2">{caracteristica.titulo}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <CardDescription className="text-base text-slate-600 leading-relaxed">
                        {caracteristica.descripcion}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* Botones de navegación mejorados con elementos decorativos */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 -translate-x-0 bg-white rounded-full p-3 shadow-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-blue-300 transition-all z-30 group/btn backdrop-blur-sm"
            aria-label="Anterior"
          >
            {/* Círculo decorativo detrás del botón */}
            <div className="absolute inset-0 bg-blue-100/20 rounded-full blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity -z-10" />
            <ChevronLeft className="h-6 w-6 text-slate-700 group-hover/btn:text-blue-600 transition-colors relative z-10" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 translate-x-0 bg-white rounded-full p-3 shadow-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-blue-300 transition-all z-30 group/btn backdrop-blur-sm"
            aria-label="Siguiente"
          >
            {/* Círculo decorativo detrás del botón */}
            <div className="absolute inset-0 bg-orange-100/20 rounded-full blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity -z-10" />
            <ChevronRight className="h-6 w-6 text-slate-700 group-hover/btn:text-blue-600 transition-colors relative z-10" />
          </button>
        </div>

        {/* Indicadores mejorados con elementos decorativos */}
        <div className="flex justify-center items-center gap-3 mt-10 relative">
          {/* Línea decorativa sutil detrás de los indicadores */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          
          {caracteristicas.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 relative ${
                index === currentIndex 
                  ? "w-10 h-2.5 bg-blue-600 shadow-md shadow-blue-600/30" 
                  : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400 hover:w-6"
              }`}
              aria-label={`Ir a funcionalidad ${index + 1}`}
            >
              {/* Círculo decorativo en indicador activo */}
              {index === currentIndex && (
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-sm animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Contador de slides */}
        <div className="text-center mt-6 text-sm text-slate-500 font-medium">
          {currentIndex + 1} / {caracteristicas.length}
        </div>
      </div>
    </section>
  )
}

// Componente de gráfico de dona animado e interactivo
function AnimatedDonutChart({ activeStep, setActiveStep, isVisible, pasos }) {
  const steps = [
    { id: 0, color: "#2563eb", label: "1", icon: <FileText className="w-4 h-4" /> }, // blue-600
    { id: 1, color: "#f97316", label: "2", icon: <BarChart3 className="w-4 h-4" /> }, // orange-500
    { id: 2, color: "#ec4899", label: "3", icon: <CheckCircle className="w-4 h-4" /> }, // pink-500
  ]
  
  const radius = 80
  const strokeWidth = 24
  const circumference = 2 * Math.PI * radius
  const segmentLength = circumference / 3
  const gap = 8 // espacio entre segmentos
  
  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96">
      {/* Anillo exterior decorativo con pulso */}
      <div 
        className={`absolute inset-0 rounded-full border-4 border-dashed transition-all duration-700 ${
          isVisible ? 'opacity-20 scale-100' : 'opacity-0 scale-90'
        }`}
        style={{ 
          borderColor: steps[activeStep].color,
          transitionDelay: '200ms'
        }}
      />
      
      {/* Círculos decorativos pulsantes */}
      <div 
        className={`absolute inset-4 rounded-full transition-all duration-1000 ${
          isVisible ? 'opacity-10' : 'opacity-0'
        }`}
        style={{ 
          backgroundColor: steps[activeStep].color,
          animation: isVisible ? 'pulse 2s infinite' : 'none'
        }}
      />
      
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full transform -rotate-90 relative z-10"
      >
        {/* Fondo del círculo */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        
        {/* Segmentos del gráfico */}
        {steps.map((step, index) => {
          const offset = index * segmentLength
          const isActive = activeStep === index
          
          return (
            <circle
              key={step.id}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={step.color}
              strokeWidth={isActive ? strokeWidth + 8 : strokeWidth}
              strokeDasharray={`${segmentLength - gap} ${circumference - segmentLength + gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className={`cursor-pointer transition-all duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              } ${isActive ? 'filter drop-shadow-lg' : 'opacity-50'}`}
              style={{
                transitionDelay: isVisible ? `${index * 200}ms` : '0ms',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                transformOrigin: 'center',
              }}
              onClick={() => setActiveStep(index)}
            />
          )
        })}
        
        {/* Líneas conectoras decorativas */}
        {steps.map((step, index) => {
          const angle = (index * 120 - 90) * (Math.PI / 180)
          const innerX = 100 + 55 * Math.cos(angle)
          const innerY = 100 + 55 * Math.sin(angle)
          const outerX = 100 + 75 * Math.cos(angle)
          const outerY = 100 + 75 * Math.sin(angle)
          const isActive = activeStep === index
          
          return (
            <line
              key={`line-${step.id}`}
              x1={innerX}
              y1={innerY}
              x2={outerX}
              y2={outerY}
              stroke={step.color}
              strokeWidth={isActive ? 3 : 2}
              strokeLinecap="round"
              className={`transition-all duration-300 ${
                isActive ? 'opacity-60' : 'opacity-20'
              }`}
            />
          )
        })}
      </svg>
      
      {/* Centro del gráfico con icono y número */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div 
          className={`w-32 h-32 md:w-36 md:h-36 rounded-full bg-white shadow-2xl flex flex-col items-center justify-center transition-all duration-500 ring-4 ring-white ${
            isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
          style={{ 
            transitionDelay: '400ms',
            boxShadow: `0 0 40px ${steps[activeStep].color}20, 0 10px 40px rgba(0,0,0,0.1)`
          }}
        >
          {/* Icono del paso */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-300"
            style={{ backgroundColor: `${steps[activeStep].color}15` }}
          >
            <span style={{ color: steps[activeStep].color }}>
              {steps[activeStep].icon}
            </span>
          </div>
          <span 
            className="text-3xl md:text-4xl font-bold transition-colors duration-300"
            style={{ color: steps[activeStep].color }}
          >
            {activeStep + 1}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Paso</span>
        </div>
      </div>
      
      {/* Etiquetas con nombre del paso alrededor */}
      {steps.map((step, index) => {
        // Posiciones para las etiquetas (arriba, derecha-abajo, izquierda-abajo)
        const positions = [
          { top: '-8%', left: '50%', transform: 'translateX(-50%)' },
          { bottom: '5%', right: '-5%', transform: 'none' },
          { bottom: '5%', left: '-5%', transform: 'none' },
        ]
        const isActive = activeStep === index
        
        return (
          <div
            key={`label-${step.id}`}
            className={`absolute cursor-pointer transition-all duration-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              ...positions[index],
              transitionDelay: isVisible ? `${700 + index * 100}ms` : '0ms',
            }}
            onClick={() => setActiveStep(index)}
          >
            <div 
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-white shadow-lg scale-105 ring-2' 
                  : 'bg-white/80 shadow-md hover:bg-white hover:shadow-lg'
              }`}
              style={{ 
                ringColor: isActive ? step.color : 'transparent',
                borderColor: step.color 
              }}
            >
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-300 ${
                  isActive ? 'scale-110' : ''
                }`}
                style={{ backgroundColor: step.color }}
              >
                {step.label}
              </div>
              <span className={`text-xs font-semibold transition-colors duration-300 whitespace-nowrap ${
                isActive ? 'text-slate-900' : 'text-slate-600'
              }`}>
                {pasos[index]?.titulo || `Paso ${index + 1}`}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)
  
  const pasos = [
    {
      titulo: "Cotización Rápida",
      descripcion: "Recibe la solicitud del cliente y genera una cotización profesional en minutos.",
      color: "blue",
      bgColor: "bg-blue-50/50",
      borderColor: "border-blue-100",
      hoverBg: "hover:bg-blue-50",
      numberBg: "bg-blue-600",
    },
    {
      titulo: "Gestión de Órdenes",
      descripcion: "Convierte la cotización aprobada en orden de trabajo y asigna tareas a tu equipo.",
      color: "orange",
      bgColor: "bg-orange-50/50",
      borderColor: "border-orange-100",
      hoverBg: "hover:bg-orange-50",
      numberBg: "bg-orange-500",
    },
    {
      titulo: "Seguimiento Completo",
      descripcion: "Haz seguimiento del estado, costos y facturación sin salir de la plataforma.",
      color: "pink",
      bgColor: "bg-pink-50/50",
      borderColor: "border-pink-100",
      hoverBg: "hover:bg-pink-50",
      numberBg: "bg-pink-500",
    },
  ]

  // Observer para detectar cuando la sección está visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Auto-rotate cada 4 segundos
  useEffect(() => {
    if (!isVisible) return
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3)
    }, 4000)

    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <section ref={sectionRef} className="relative bg-white overflow-hidden py-20">
      {/* SVGs decorativos difuminados */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Círculos difuminados */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-pink-100/30 rounded-full blur-3xl" />
        
        {/* Formas geométricas difuminadas */}
        <svg className="absolute top-20 left-10 w-48 h-48 text-blue-200/20 blur-sm" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" opacity="0.4" />
          <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        </svg>
        
        <svg className="absolute bottom-20 right-10 w-40 h-40 text-pink-200/20 blur-sm" viewBox="0 0 200 200" fill="none">
          <path d="M100 20 L180 100 L100 180 L20 100 Z" stroke="currentColor" strokeWidth="2" opacity="0.4" />
        </svg>
        
        <svg className="absolute top-1/2 right-1/4 w-24 h-24 text-orange-200/20 blur-sm" viewBox="0 0 100 100" fill="none">
          <polygon points="50,10 90,90 10,90" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
        </svg>
        
        {/* Puntos decorativos */}
        <div className="absolute top-32 right-1/3 w-3 h-3 bg-blue-400/20 rounded-full blur-sm" />
        <div className="absolute bottom-40 left-1/4 w-4 h-4 bg-orange-400/20 rounded-full blur-sm" />
        <div className="absolute top-1/2 left-10 w-2 h-2 bg-pink-400/20 rounded-full blur-sm" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 items-center">
          {/* Columna izquierda: Gráfico de dona */}
          <div className="order-1 lg:order-1 flex items-center justify-center">
            <div className="relative">
              {/* Efecto de brillo detrás */}
              <div className="absolute -inset-8 bg-gradient-to-r from-blue-200/30 via-orange-200/20 to-pink-200/30 rounded-full blur-2xl" />
              
              <AnimatedDonutChart 
                activeStep={activeStep} 
                setActiveStep={setActiveStep}
                isVisible={isVisible}
                pasos={pasos}
              />
            </div>
          </div>

          {/* Columna derecha: Contenido */}
          <div className="order-2 lg:order-2">
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 rounded-full px-4 py-1.5 text-xs font-semibold">
              Proceso Simplificado
            </Badge>
            <h2 className="mb-5 text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              Cómo TrackMySign encaja en tu día a día
            </h2>
            <p className="mb-8 text-base sm:text-lg text-slate-700 leading-relaxed">
              Desde la primera llamada del cliente hasta la instalación final, TrackMySign te acompaña en cada paso del
              proceso. Sin hojas de cálculo sueltas ni información perdida.
            </p>
            
            {/* Lista de pasos interactiva */}
            <div className="space-y-4">
              {pasos.map((paso, index) => (
                <div 
                  key={index}
                  className={`flex gap-4 items-start p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    activeStep === index 
                      ? `${paso.bgColor} ${paso.borderColor} shadow-lg scale-[1.02] border-2` 
                      : `bg-white/50 border-slate-200 hover:border-slate-300 ${paso.hoverBg}`
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className={`h-10 w-10 rounded-full ${paso.numberBg} flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-300 ${
                    activeStep === index ? 'scale-110' : ''
                  }`}>
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`font-bold text-lg mb-1 transition-colors duration-300 ${
                      activeStep === index ? 'text-slate-900' : 'text-slate-700'
                    }`}>
                      {paso.titulo}
                    </p>
                    <p className={`text-sm sm:text-base leading-relaxed transition-all duration-300 ${
                      activeStep === index ? 'text-slate-600 max-h-20 opacity-100' : 'text-slate-500 max-h-20 opacity-80'
                    }`}>
                      {paso.descripcion}
                    </p>
                  </div>
                  {/* Indicador de activo */}
                  <div className={`self-center transition-all duration-300 ${
                    activeStep === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>

            {/* Indicador de progreso */}
            <div className="mt-6 flex items-center gap-2">
              {pasos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeStep === index 
                      ? 'w-8 bg-blue-600' 
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
              <span className="ml-3 text-xs text-slate-500">
                Paso {activeStep + 1} de 3
              </span>
            </div>
          </div>
        </div>
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

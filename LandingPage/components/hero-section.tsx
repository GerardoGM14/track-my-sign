import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="absolute inset-0 bg-[url('/professional-business-team-collaboration.jpg')] bg-cover bg-center opacity-20" />

      <div className="relative max-w-screen-xl mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <span className="text-sm font-semibold text-gray-700 tracking-wider uppercase">Your Business Platform</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 text-balance">
            Where go-to-market teams go to grow
            <span className="text-orange-600">.</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto text-pretty leading-relaxed">
            Unite marketing, sales, and customer service on one AI-powered customer platform that delivers results fast.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 h-14 text-lg font-medium">
              Get a demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-8 h-14 text-lg font-medium bg-transparent"
            >
              Get started free
            </Button>
          </div>
        </div>
      </div>

      {/* Chat widget mockup */}
      <div className="hidden lg:block absolute bottom-8 right-8 bg-white rounded-2xl shadow-2xl p-4 max-w-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">AI</span>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              🟡 Want to chat about our platform? I'm an AI chatbot here to help you find your way.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

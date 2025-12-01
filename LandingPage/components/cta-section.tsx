import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Get started with HubSpot today</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Join thousands of businesses growing better with our customer platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8">
            Get a demo
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-orange-600 text-lg px-8 bg-transparent"
          >
            Get started free
          </Button>
        </div>
        <p className="mt-6 text-sm opacity-75">Get started with free tools, or get more with our premium software.</p>
      </div>
    </section>
  )
}

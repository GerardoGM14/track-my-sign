import { Zap, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProductsSection() {
  const products = [
    {
      icon: Zap,
      badge: "Powered by AI",
      title: "Growing a business",
      description: "Get the tools you need to launch and scale your business with confidence.",
      features: ["Generate your website with AI", "Attract and convert leads", "Close deals faster"],
    },
    {
      icon: TrendingUp,
      badge: "Marketing Hub®",
      title: "Marketing Hub®",
      description: "Attract and convert the right leads, launch campaigns faster, and prove ROI.",
      features: [
        "Attract and convert the right leads",
        "Launch campaigns faster with AI",
        "Prove and improve your marketing ROI",
      ],
    },
    {
      icon: Users,
      badge: "Sales Hub®",
      title: "Sales Hub®",
      description: "Generate quality leads and close deals faster with intelligent sales automation.",
      features: [
        "Generate quality leads and close faster",
        "Automate your entire sales process",
        "Get insights to improve performance",
      ],
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-orange-600 mb-4">
                  <product.icon className="h-5 w-5" />
                  <span className="text-sm font-semibold">{product.badge}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{product.title}</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg
                      className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant="link" className="text-orange-600 hover:text-orange-700 px-0">
                Learn more →
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

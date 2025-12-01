"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PlatformSection() {
  const [activeSlide, setActiveSlide] = useState(0)

  const slides = [
    {
      title: "A CRM that's really smart.",
      description: "Our Smart CRM is the single source of truth that connects all your business data.",
      image: "/modern-crm-dashboard-interface.jpg",
    },
    {
      title: "Marketing that converts.",
      description: "Create campaigns that attract and convert the right leads with powerful automation.",
      image: "/marketing-automation-dashboard.jpg",
    },
    {
      title: "Sales that close faster.",
      description: "Generate quality leads and close deals faster with intelligent sales tools.",
      image: "/sales-pipeline-dashboard.jpg",
    },
  ]

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">The Customer Platform</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Connected data and tools make it easier to know, do, and connect everything across your business.
          </p>
        </div>

        <div className="relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 text-balance">
                {slides[activeSlide].title}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">{slides[activeSlide].description}</p>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={slides[activeSlide].image || "/placeholder.svg"}
                  alt={slides[activeSlide].title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-12">
            <Button variant="outline" size="icon" onClick={prevSlide} className="rounded-full bg-transparent">
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeSlide ? "bg-gray-900 w-8" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={nextSlide} className="rounded-full bg-transparent">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

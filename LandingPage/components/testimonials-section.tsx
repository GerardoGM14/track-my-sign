"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "HubSpot has transformed how we work. The platform makes it easy to align our entire team around our customers.",
      author: "Sarah Johnson",
      role: "VP of Marketing",
      company: "TechCorp Inc.",
      rating: 5,
    },
    {
      quote: "We've seen a 3x increase in qualified leads since implementing HubSpot. The ROI speaks for itself.",
      author: "Michael Chen",
      role: "Head of Sales",
      company: "GrowthLabs",
      rating: 5,
    },
    {
      quote: "The customer support is outstanding. Whenever we need help, the team is there to guide us.",
      author: "Emily Rodriguez",
      role: "Customer Success Manager",
      company: "ServicePro",
      rating: 5,
    },
  ]

  const [current, setCurrent] = useState(0)

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Loved by customers worldwide</h2>
          <p className="text-xl text-gray-600">See what our customers have to say</p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="bg-gray-50 p-12 rounded-lg">
            <div className="flex mb-4">
              {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-orange-600 text-orange-600" />
              ))}
            </div>
            <blockquote className="text-2xl font-medium mb-8 text-gray-900">"{testimonials[current].quote}"</blockquote>
            <div>
              <div className="font-bold text-lg">{testimonials[current].author}</div>
              <div className="text-gray-600">
                {testimonials[current].role}, {testimonials[current].company}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrent((current - 1 + testimonials.length) % testimonials.length)}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrent((current + 1) % testimonials.length)}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

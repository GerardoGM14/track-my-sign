import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CustomersSection } from "@/components/customers-section"
import { PlatformSection } from "@/components/platform-section"
import { ProductsSection } from "@/components/products-section"
import { ResourcesSection } from "@/components/resources-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <CustomersSection />
        <PlatformSection />
        <ProductsSection />
        <ResourcesSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

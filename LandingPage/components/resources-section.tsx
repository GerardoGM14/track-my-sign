import { ArrowRight, BookOpen, Video, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ResourcesSection() {
  const resources = [
    {
      icon: BookOpen,
      title: "Academy",
      description: "Free online training courses and certifications to grow your skills.",
      link: "Browse courses",
    },
    {
      icon: Video,
      title: "Community",
      description: "Connect with 200,000+ marketing, sales, and service professionals.",
      link: "Join community",
    },
    {
      icon: FileText,
      title: "Blog",
      description: "Marketing, sales, and service insights from industry experts.",
      link: "Read blog",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Learn and grow with HubSpot</h2>
          <p className="text-xl text-gray-600">Everything you need to grow better.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <resource.icon className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">{resource.title}</h3>
              <p className="text-gray-600 mb-6">{resource.description}</p>
              <Button variant="link" className="text-orange-600 p-0 h-auto font-semibold">
                {resource.link} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

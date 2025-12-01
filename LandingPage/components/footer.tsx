import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

export function Footer() {
  const footerSections = [
    {
      title: "Popular Features",
      links: [
        "Free Meeting Scheduler",
        "Social Media Tools",
        "Email Tracking",
        "Sales Email Automation",
        "Ads Software",
        "Email Marketing",
        "Lead Management",
        "Pipeline Management",
      ],
    },
    {
      title: "Free Tools",
      links: [
        "Website Grader",
        "Make My Persona",
        "Email Signature Generator",
        "Brand Kit Generator",
        "Blog Ideas Generator",
        "Invoice Generator",
        "Marketing Plan Generator",
        "Business Templates",
      ],
    },
    {
      title: "Company",
      links: [
        "About Us",
        "Careers",
        "Management Team",
        "Board of Directors",
        "Investor Relations",
        "Partners",
        "Contact Us",
      ],
    },
    {
      title: "Customers",
      links: [
        "Customer Support",
        "Join a Local User Group",
        "Certification",
        "Training",
        "Agency Directory",
        "App Marketplace",
        "Community",
        "Developer Resources",
      ],
    },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-bold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="hover:text-white transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white">
                Terms of Use
              </a>
              <a href="#" className="hover:text-white">
                Security
              </a>
              <a href="#" className="hover:text-white">
                Sitemap
              </a>
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-gray-500">© 2025 HubSpot, Inc. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}

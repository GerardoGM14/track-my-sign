"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, Search, Menu } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3 max-w-screen-2xl mx-auto">
        {/* Top bar utilities */}
        <div className="hidden lg:flex items-center gap-4 text-sm">
          <button className="flex items-center gap-1 hover:text-gray-600">
            English <ChevronDown className="h-4 w-4" />
          </button>
          <span className="text-gray-400">|</span>
          <button className="hover:text-gray-600">High Contrast</button>
          <span className="text-gray-400">|</span>
          <button className="hover:text-gray-600">Customer Support</button>
          <span className="text-gray-400">|</span>
          <button className="hover:text-gray-600">Contact Sales</button>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Search className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
          <button className="text-sm hover:text-gray-600">Log in</button>
          <button className="flex items-center gap-1 text-sm hover:text-gray-600">
            About <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Main navigation */}
      <div className="border-t border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full" />
              <span className="text-xl font-bold text-orange-600">YourBrand</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium">
                Products <ChevronDown className="h-4 w-4" />
              </button>
              <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium">
                Solutions <ChevronDown className="h-4 w-4" />
              </button>
              <button className="text-gray-700 hover:text-gray-900 font-medium">Pricing</button>
              <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium">
                Resources <ChevronDown className="h-4 w-4" />
              </button>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 bg-transparent">
              Get started free
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">Get a demo</Button>
          </div>
        </div>
      </div>
    </header>
  )
}

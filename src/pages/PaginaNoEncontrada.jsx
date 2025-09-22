"use client"

import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Page not found</p>
      <Button onClick={() => navigate("/")}>Go Home</Button>
    </div>
  )
}

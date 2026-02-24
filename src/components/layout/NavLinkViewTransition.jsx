"use client"

import { NavLink } from "react-router-dom"

// Envoltura ligera sobre NavLink para habilitar viewTransition en toda la app
export function NavLinkViewTransition({ children, ...props }) {
  return (
    <NavLink
      {...props}
      // React Router 6.22+ soporta esta prop para habilitar View Transitions del navegador
      viewTransition
    >
      {children}
    </NavLink>
  )
}




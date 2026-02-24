import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ProveedorAuth } from "./contexts/ContextoAuth"
import { ProveedorTienda } from "./contexts/ContextoTienda"
import { Layout } from "./components/layout/Layout"
import { RutaProtegida } from "./components/layout/RutaProtegida"
import LandingPage from "./pages/public/LandingPage"
import { PaginaPlanes } from "./pages/public/PaginaPlanes"
import { PaginaLogin } from "./pages/auth/PaginaLogin"
import { PaginaRegistro } from "./pages/auth/PaginaRegistro"
import { PaginaProductos } from "@/pages/dashboard/admin/PaginaProductos"
import { PaginaPrecios } from "@/pages/dashboard/admin/PaginaPrecios"
import PaginaPreciosSaaS from "./pages/public/PaginaPreciosSaaS"
import { PaginaCotizaciones } from "@/pages/dashboard/shared/PaginaCotizaciones"
import { PaginaOrdenes } from "@/pages/dashboard/shared/PaginaOrdenes"
import { PaginaClientes } from "@/pages/dashboard/shared/PaginaClientes"
import { PortalCliente } from "./pages/public/PortalCliente"
import { PaginaNoEncontrada } from "./pages/public/PaginaNoEncontrada"
import { PaginaFacturacion } from "@/pages/dashboard/admin/PaginaFacturacion"
import PaginaUsuarios from "@/pages/dashboard/admin/PaginaUsuarios"
import PaginaConfiguracion from "@/pages/dashboard/admin/PaginaConfiguracion"
import PaginaMaestros from "@/pages/dashboard/admin/PaginaMaestros"
import PaginaPerfil from "@/pages/dashboard/shared/PaginaPerfil"
import SuperAdminLicencia from "./pages/super-admin/SuperAdminLicencia"
import DashboardSuperAdmin from "./pages/super-admin/DashboardSuperAdmin"
import PaginaGestionTiendas from "./pages/super-admin/PaginaGestionTiendas"
import PaginaAnalyticsGlobal from "./pages/super-admin/PaginaAnalyticsGlobal"
import PaginaAdministracion from "./pages/super-admin/PaginaAdministracion"
import { RutaDashboard } from "./components/layout/RutaDashboard"
import LayoutDashboard from "./components/layout/LayoutDashboard"
import { RouteLoader } from "./components/layout/RouteLoader"

function App() {
  return (
    <Router>
      <RouteLoader />
      <ProveedorAuth>
        <ProveedorTienda>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/planes" element={<PaginaPlanes />} />
              <Route path="/precios" element={<PaginaPreciosSaaS />} />
              <Route path="/login" element={<PaginaLogin />} />
              <Route path="/register" element={<PaginaRegistro />} />

              <Route
                path="/:slugTienda"
                element={
                  <RutaProtegida>
                    <RutaDashboard />
                  </RutaProtegida>
                }
              />

              {/* Rutas protegidas por tienda */}
              <Route
                path="/:slugTienda/productos"
                element={
                  <RutaProtegida>
                    <LayoutDashboard>
                      <PaginaProductos />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/precios"
                element={
                  <RutaProtegida>
                    <LayoutDashboard>
                      <PaginaPrecios />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/cotizaciones"
                element={
                  <RutaProtegida>
                    <LayoutDashboard>
                      <PaginaCotizaciones />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/ordenes"
                element={
                  <RutaProtegida>
                    <LayoutDashboard>
                      <PaginaOrdenes />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/clientes"
                element={
                  <RutaProtegida>
                    <LayoutDashboard>
                      <PaginaClientes />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/facturacion"
                element={
                  <RutaProtegida rolRequerido="admin">
                    <LayoutDashboard>
                      <PaginaFacturacion />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/usuarios"
                element={
                  <RutaProtegida rolRequerido="admin">
                    <LayoutDashboard>
                      <PaginaUsuarios />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/maestros"
                element={
                  <RutaProtegida rolRequerido="admin">
                    <LayoutDashboard>
                      <PaginaMaestros />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/configuracion"
                element={
                  <RutaProtegida rolRequerido="admin">
                    <LayoutDashboard>
                      <PaginaConfiguracion />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />

              {/* Rutas de Super Admin */}
              <Route
                path="/super-admin/dashboard"
                element={
                  <RutaProtegida rolRequerido="superadmin">
                    <LayoutDashboard>
                      <DashboardSuperAdmin />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/super-admin/tiendas"
                element={
                  <RutaProtegida rolRequerido="superadmin">
                    <LayoutDashboard>
                      <PaginaGestionTiendas />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/super-admin/analytics"
                element={
                  <RutaProtegida rolRequerido="superadmin">
                    <LayoutDashboard>
                      <PaginaAnalyticsGlobal />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/super-admin/admin"
                element={
                  <RutaProtegida rolRequerido="superadmin">
                    <LayoutDashboard>
                      <PaginaAdministracion />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/super-admin/licencias"
                element={
                  <LayoutDashboard>
                    <SuperAdminLicencia />
                  </LayoutDashboard>
                }
              />

              {/* Portal público para clientes */}
              <Route path="/cliente/:tokenCliente" element={<PortalCliente />} />
              <Route path="*" element={<PaginaNoEncontrada />} />
            </Routes>
          </Layout>
        </ProveedorTienda>
      </ProveedorAuth>
    </Router>
  )
}

export default App

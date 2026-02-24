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
import PaginaDetalleOrden from "@/pages/dashboard/shared/PaginaDetalleOrden"
import { PaginaClientes } from "@/pages/dashboard/shared/PaginaClientes"
import PaginaSolicitarCotizacion from "@/pages/dashboard/customer/PaginaSolicitarCotizacion"
import { PortalCliente } from "./pages/public/PortalCliente"
import { PaginaNoEncontrada } from "./pages/public/PaginaNoEncontrada"
import { PaginaFacturacion } from "@/pages/dashboard/admin/PaginaFacturacion"
import PaginaUsuarios from "@/pages/dashboard/admin/PaginaUsuarios"
import PaginaConfiguracion from "@/pages/dashboard/admin/PaginaConfiguracion"
import PaginaMaestros from "@/pages/dashboard/admin/PaginaMaestros"
import PaginaPerfil from "@/pages/dashboard/shared/PaginaPerfil"
import SuperAdminLicencia from "@/pages/dashboard/superadmin/SuperAdminLicencia"
import DashboardSuperAdmin from "@/pages/dashboard/superadmin/DashboardSuperAdmin"
import PaginaGestionTiendas from "@/pages/dashboard/superadmin/PaginaGestionTiendas"
import PaginaAnalyticsGlobal from "@/pages/dashboard/superadmin/PaginaAnalyticsGlobal"
import PaginaAdministracion from "@/pages/dashboard/superadmin/PaginaAdministracion"
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
                  <RutaProtegida rolRequerido="employee">
                    <LayoutDashboard>
                      <PaginaProductos />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/precios"
                element={
                  <RutaProtegida rolRequerido="employee">
                    <LayoutDashboard>
                      <PaginaPrecios />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/cotizaciones"
                element={
                  <RutaProtegida rolRequerido="customer">
                    <LayoutDashboard>
                      <PaginaCotizaciones />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/cotizaciones/solicitar"
                element={
                  <RutaProtegida rolRequerido="customer">
                    <LayoutDashboard>
                      <PaginaSolicitarCotizacion />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/ordenes"
                element={
                  <RutaProtegida rolRequerido="customer">
                    <LayoutDashboard>
                      <PaginaOrdenes />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/ordenes/:id"
                element={
                  <RutaProtegida rolRequerido="customer">
                    <LayoutDashboard>
                      <PaginaDetalleOrden />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/clientes"
                element={
                  <RutaProtegida rolRequerido="employee">
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

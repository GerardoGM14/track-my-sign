import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ProveedorAuth } from "./contexts/ContextoAuth"
import { ProveedorTienda } from "./contexts/ContextoTienda"
import { Layout } from "./components/Layout"
import { RutaProtegida } from "./components/RutaProtegida"
import LandingPage from "./pages/LandingPage"
import { PaginaPlanes } from "./pages/PaginaPlanes"
import { PaginaLogin } from "./pages/PaginaLogin"
import { PaginaRegistro } from "./pages/PaginaRegistro"
import { PaginaProductos } from "./pages/PaginaProductos"
import { PaginaPrecios } from "./pages/PaginaPrecios"
import PaginaPreciosSaaS from "./pages/PaginaPreciosSaaS"
import { PaginaCotizaciones } from "./pages/PaginaCotizaciones"
import { PaginaOrdenes } from "./pages/PaginaOrdenes"
import { PaginaClientes } from "./pages/PaginaClientes"
import { PortalCliente } from "./pages/PortalCliente"
import { PaginaNoEncontrada } from "./pages/PaginaNoEncontrada"
import { PaginaFacturacion } from "./pages/PaginaFacturacion"
import PaginaUsuarios from "./pages/PaginaUsuarios"
import PaginaConfiguracion from "./pages/PaginaConfiguracion"
import PaginaMaestros from "./pages/PaginaMaestros"
import { RutaDashboard } from "./components/RutaDashboard"
import LayoutDashboard from "./components/LayoutDashboard"

function App() {
  return (
    <Router>
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
                  <RutaProtegida>
                    <LayoutDashboard>
                      <PaginaFacturacion />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/usuarios"
                element={
                  <RutaProtegida>
                    <LayoutDashboard>
                      <PaginaUsuarios />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/maestros"
                element={
                  <RutaProtegida>
                    <LayoutDashboard>
                      <PaginaMaestros />
                    </LayoutDashboard>
                  </RutaProtegida>
                }
              />
              <Route
                path="/:slugTienda/configuracion"
                element={
                  <RutaProtegida>
                    <LayoutDashboard>
                      <PaginaConfiguracion />
                    </LayoutDashboard>
                  </RutaProtegida>
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
